import { randomUUID } from "node:crypto";
import type { Database } from "@storage-minis/db";
import Fastify, { LogController } from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { PinoLoggerOptions } from "fastify/types/logger.js";
import type { ApiConfig } from "./config.js";
import { serializeError } from "./error-log.js";
import { healthRoutes } from "./health.js";
import {
  isTrpcUrl,
  procedureField,
  sendTrpcFailure,
  trpcPrefix,
  trpcRoutes,
} from "./trpc/plugin.js";
import { appRouter } from "./trpc/router.js";

/**
 * What the app may use from its owner. The lifecycle owns the pool; `close`
 * and `healthy` stay out of reach so no route or plugin can end it.
 */
export interface AppDependencies {
  database: Pick<Database, "db" | "check">;
  isClosing: () => boolean;
}

function safeFailure(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  switch (code) {
    case "FST_ERR_CTP_BODY_TOO_LARGE":
      return { status: 413, category: "payload_too_large" };
    case "FST_ERR_CTP_INVALID_MEDIA_TYPE":
      return { status: 415, category: "unsupported_media_type" };
    case "FST_ERR_BAD_URL":
    case "FST_ERR_CTP_INVALID_JSON_BODY":
    case "FST_ERR_CTP_EMPTY_JSON_BODY":
    case "FST_ERR_CTP_INVALID_CONTENT_LENGTH":
    case "FST_ERR_VALIDATION":
      return { status: 400, category: "bad_request" };
    default: {
      const status =
        error && typeof error === "object" && "statusCode" in error
          ? error.statusCode
          : undefined;
      if (
        typeof status === "number" &&
        Number.isInteger(status) &&
        status >= 400 &&
        status < 500
      ) {
        return { status, category: "request_error" };
      }
      return { status: 500, category: "internal_error" };
    }
  }
}

function sendFailure(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { status, category } = safeFailure(error);
  // Like Fastify's default: client errors are info, server errors error.
  const fields = { category, status, ...procedureField(request), err: error };
  if (status >= 500) request.log.error(fields, "request_failed");
  else request.log.info(fields, "request_failed");
  void reply.code(status).send({ error: category });
}

export function buildApp(
  httpConfig: ApiConfig["http"],
  dependencies: AppDependencies,
) {
  // Pino permits omitting raw error fields; Fastify's specialized err type
  // unnecessarily requires message/stack. Use its exported Pino dictionary type.
  const messages = httpConfig.nodeEnv === "development";
  const serializers: PinoLoggerOptions["serializers"] = {
    req: (request: FastifyRequest) => ({
      method: request.method,
      route: request.routeOptions?.url ?? "unmatched",
    }),
    res: (reply: Pick<FastifyReply, "statusCode">) => ({
      status: reply.statusCode,
    }),
    // Every `err` Fastify or a route logs passes through the allowlist.
    err: (error: unknown) => serializeError(error, { messages }),
  };
  const app = Fastify({
    bodyLimit: 16 * 1024,
    requestTimeout: 10_000,
    forceCloseConnections: "idle",
    trustProxy: false,
    requestIdHeader: false,
    genReqId: () => randomUUID(),
    logController: new LogController({ disableRequestLogging: true }),
    logger: {
      level: httpConfig.logLevel,
      base: null,
      stream: process.stdout,
      redact: ["req.headers.authorization", "req.headers.cookie"],
      serializers,
    },
    // Failures before routing (malformed URL) under /trpc keep its envelope.
    frameworkErrors: (error, request, reply) => {
      if (isTrpcUrl(request.url)) sendTrpcFailure(error, request, reply);
      else sendFailure(error, request, reply);
    },
  });

  // Set by the tRPC procedure middleware; read by the request logs below.
  app.decorateRequest("trpcProcedure", null);

  app.setErrorHandler(sendFailure);
  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({ error: "not_found" }),
  );
  app.addHook("onResponse", (request, reply, done) => {
    request.log.info(
      {
        method: request.method,
        route: request.routeOptions.url ?? "unmatched",
        ...procedureField(request),
        status: reply.statusCode,
        elapsedMs: reply.elapsedTime,
      },
      "request_completed",
    );
    done();
  });

  // The single composition root: production and app.inject() tests build the
  // same plugins. Fastify loads them during app.ready(), owned by the lifecycle.
  void app.register(healthRoutes, {
    database: dependencies.database,
    isClosing: dependencies.isClosing,
  });
  void app.register(trpcRoutes, {
    prefix: trpcPrefix,
    router: appRouter,
    db: dependencies.database.db,
  });

  return app;
}
