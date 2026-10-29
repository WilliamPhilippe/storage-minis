import { randomUUID } from "node:crypto";
import type { Database } from "@storage-minis/db";
import Fastify, { LogController } from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { PinoLoggerOptions } from "fastify/types/logger.js";
import type { ApiConfig } from "./config.js";

export interface AppDependencies {
  database: Pick<Database, "check">;
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
  request.log.error({ category, status }, "request_failed");
  void reply.code(status).send({ error: category });
}

export function buildApp(
  httpConfig: ApiConfig["http"],
  dependencies: AppDependencies,
) {
  // Pino permits omitting raw error fields; Fastify's specialized err type
  // unnecessarily requires message/stack. Use its exported Pino dictionary type.
  const serializers: PinoLoggerOptions["serializers"] = {
    req: (request: FastifyRequest) => ({
      method: request.method,
      route: request.routeOptions?.url ?? "unmatched",
    }),
    res: (reply: Pick<FastifyReply, "statusCode">) => ({
      status: reply.statusCode,
    }),
    err: () => ({ category: "internal_error" }),
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
    frameworkErrors: sendFailure,
  });

  app.setErrorHandler(sendFailure);
  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({ error: "not_found" }),
  );
  app.addHook("onResponse", (request, reply, done) => {
    request.log.info(
      {
        method: request.method,
        route: request.routeOptions.url ?? "unmatched",
        status: reply.statusCode,
        elapsedMs: reply.elapsedTime,
      },
      "request_completed",
    );
    done();
  });

  app.get("/health/live", (_request, reply) => reply.send({ status: "ok" }));
  app.get("/health/ready", async (request, reply) => {
    if (!dependencies.isClosing()) {
      try {
        await dependencies.database.check();
        // Shutdown may have begun while the current check was in flight.
        if (!dependencies.isClosing()) return { status: "ready" };
      } catch {
        request.log.warn(
          { category: "database_unavailable", status: 503 },
          "readiness_unavailable",
        );
      }
    }
    return reply.code(503).send({ status: "unavailable" });
  });

  return app;
}
