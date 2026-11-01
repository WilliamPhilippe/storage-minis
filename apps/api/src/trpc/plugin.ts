import type { Database } from "@storage-minis/db";
import { TRPCError } from "@trpc/server";
import type { AnyTRPCRouter, TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { fastifyRequestHandler } from "@trpc/server/adapters/fastify";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { createContextFactory } from "./context.js";
import { errorCategory, errorShape } from "./errors.js";

export interface TrpcOptions {
  router: AnyTRPCRouter;
  db: Database["db"];
}

/** Production mount point; `buildApp` registers the plugin with this prefix. */
export const trpcPrefix = "/trpc";

// 1 MiB on the tRPC route only; every other route keeps the app's 16 KiB.
// Procedure inputs bound their own strings and arrays with `.max()` (P5-03).
export const trpcLimits = { bodyBytes: 1024 * 1024 } as const;

/** True for `/trpc` and paths below it, never for `/trpc-test` or `/trpcx`. */
export function isTrpcUrl(url: string): boolean {
  const path = url.split("?", 1)[0] ?? "";
  return path === trpcPrefix || path.startsWith(`${trpcPrefix}/`);
}

/** `{ procedure }` once the procedure's middleware ran, otherwise nothing. */
export function procedureField(request: FastifyRequest) {
  return typeof request.trpcProcedure === "string"
    ? { procedure: request.trpcProcedure }
    : {};
}

/**
 * One `request_failed` line per tRPC failure, shaped like the root handler's:
 * `procedure` appears only when the procedure's middleware ran. The `err`
 * serializer applies the API's allowlist (error-log.ts); input is never read.
 */
function logFailure(request: FastifyRequest, error: TRPCError) {
  const status = errorShape(error).data.httpStatus;
  const fields = {
    category: errorCategory(error),
    status,
    ...procedureField(request),
    err: error,
  };
  if (status >= 500) request.log.error(fields, "request_failed");
  else request.log.info(fields, "request_failed");
}

function fastifyFailureCode(error: unknown): TRPC_ERROR_CODE_KEY {
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  switch (code) {
    case "FST_ERR_CTP_BODY_TOO_LARGE":
      return "PAYLOAD_TOO_LARGE";
    case "FST_ERR_CTP_INVALID_MEDIA_TYPE":
      return "UNSUPPORTED_MEDIA_TYPE";
    case "FST_ERR_CTP_INVALID_JSON_BODY":
    case "FST_ERR_CTP_EMPTY_JSON_BODY":
      return "PARSE_ERROR";
    default: {
      const status =
        error && typeof error === "object" && "statusCode" in error
          ? error.statusCode
          : undefined;
      return typeof status === "number" && status >= 400 && status < 500
        ? "BAD_REQUEST"
        : "INTERNAL_SERVER_ERROR";
    }
  }
}

/**
 * Failures Fastify handles before or around tRPC (body limit, media type,
 * malformed JSON or URL, unknown path) use the same envelope as tRPC's own.
 */
export function sendTrpcFailure(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // The original error stays the cause, so the log keeps its type and code.
  const failure =
    error instanceof TRPCError
      ? error
      : new TRPCError({ code: fastifyFailureCode(error), cause: error });
  logFailure(request, failure);
  const shape = errorShape(failure);
  void reply.code(shape.data.httpStatus).send({ error: shape });
}

/**
 * The tRPC transport (Step 5 plan, approved 2026-11-01). The route calls the
 * official adapter's `fastifyRequestHandler` instead of registering
 * `fastifyTRPCPlugin`, which would replace this scope's JSON parser with a raw
 * string pass-through and forward multipart bodies (owner-approved deviation,
 * 2026-11-01). Plain JSON, no batching, no method override, no subscriptions.
 */
export const trpcRoutes: FastifyPluginAsync<TrpcOptions> = (
  app,
  { router, db },
) => {
  // The tRPC client posts `content-type: application/json` with no body for a
  // mutation without input; Fastify's default parser rejects an empty body.
  // Every other body still goes through that parser and its poisoning checks.
  const defaultJsonParser = app.getDefaultJsonParser(
    app.initialConfig.onProtoPoisoning ?? "error",
    app.initialConfig.onConstructorPoisoning ?? "ignore",
  );
  app.addContentTypeParser<string>(
    "application/json",
    { parseAs: "string" },
    (request, body, done) => {
      if (body === "") done(null, undefined);
      // Fastify's default parser is callback-based and returns nothing.
      else void defaultJsonParser(request, body, done);
    },
  );
  app.setErrorHandler(sendTrpcFailure);
  app.setNotFoundHandler((request, reply) => {
    sendTrpcFailure(new TRPCError({ code: "NOT_FOUND" }), request, reply);
  });

  const createContext = createContextFactory(db);
  app.all<{ Params: { path: string } }>(
    "/:path",
    { bodyLimit: trpcLimits.bodyBytes },
    (request, reply) =>
      fastifyRequestHandler({
        router,
        req: request,
        res: reply,
        path: request.params.path,
        allowBatching: false,
        // tRPC labels errors it raises before resolving a call (batching,
        // media type) text/plain; every envelope is JSON (approved
        // 2026-11-01). Only the object form sets rather than appends in
        // 11.22.1; tRPC deprecates it for v12, so revisit on that upgrade.
        responseMeta: () => ({
          headers: { "content-type": "application/json" },
        }),
        createContext,
        onError: ({ error, req }) => {
          logFailure(req, error);
        },
      }),
  );
  return Promise.resolve();
};
