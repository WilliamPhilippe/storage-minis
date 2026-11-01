import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY, TRPCErrorShape } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import { ZodError } from "zod";

/**
 * The one tRPC error envelope (Step 5 plan P5-04, approved 2026-11-01). The
 * router's errorFormatter and the Fastify-level handlers under /trpc both build
 * it here, so the client's typed `error.data` matches every failure.
 *
 * Messages are fixed per code: tRPC's own messages echo client text (Zod issue
 * JSON with unknown key names, the procedure path, the method, the content
 * type). `data` carries only the code, the HTTP status and, for input
 * validation, each issue's path and Zod code.
 */

export interface ErrorIssue {
  path: (string | number)[];
  code: string;
}

export interface ErrorData {
  code: TRPC_ERROR_CODE_KEY;
  httpStatus: number;
  issues?: ErrorIssue[];
}

export type ErrorShape = TRPCErrorShape<ErrorData>;

export const errorLimits = { issues: 20 } as const;

// A Record over every code: a tRPC release adding a code fails to compile.
const messages: Record<TRPC_ERROR_CODE_KEY, string> = {
  PARSE_ERROR: "Invalid JSON",
  BAD_REQUEST: "Invalid request",
  UNAUTHORIZED: "Unauthorized",
  PAYMENT_REQUIRED: "Payment required",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  METHOD_NOT_SUPPORTED: "Method not supported",
  TIMEOUT: "Request timeout",
  CONFLICT: "Conflict",
  PRECONDITION_FAILED: "Precondition failed",
  PAYLOAD_TOO_LARGE: "Payload too large",
  UNSUPPORTED_MEDIA_TYPE: "Unsupported media type",
  UNPROCESSABLE_CONTENT: "Unprocessable content",
  PRECONDITION_REQUIRED: "Precondition required",
  TOO_MANY_REQUESTS: "Too many requests",
  CLIENT_CLOSED_REQUEST: "Client closed request",
  INTERNAL_SERVER_ERROR: "Internal server error",
  NOT_IMPLEMENTED: "Not implemented",
  BAD_GATEWAY: "Bad gateway",
  SERVICE_UNAVAILABLE: "Service unavailable",
  GATEWAY_TIMEOUT: "Gateway timeout",
};

/**
 * The code a client sees. tRPC 11.22.1 parses a query's `input` parameter
 * inside its input reader and reports invalid JSON as BAD_REQUEST with the
 * SyntaxError as cause; the owner approved (2026-11-01) reporting it as
 * PARSE_ERROR, like a malformed body.
 */
export function publicError(error: TRPCError): TRPCError {
  if (error.code === "BAD_REQUEST" && error.cause instanceof SyntaxError) {
    return new TRPCError({ code: "PARSE_ERROR", cause: error });
  }
  return error;
}

/** Only an input-validation failure exposes issues, never output validation. */
function issues(error: TRPCError): ErrorIssue[] | undefined {
  if (error.code !== "BAD_REQUEST" || !(error.cause instanceof ZodError)) {
    return undefined;
  }
  return error.cause.issues.slice(0, errorLimits.issues).map((issue) => ({
    path: issue.path.map((key) =>
      typeof key === "number" ? key : String(key),
    ),
    code: issue.code,
  }));
}

export function errorShape(error: TRPCError): ErrorShape {
  const visible = publicError(error);
  const data: ErrorData = {
    code: visible.code,
    httpStatus: getHTTPStatusCodeFromError(visible),
  };
  const found = issues(visible);
  if (found !== undefined) data.issues = found;
  return {
    message: messages[visible.code],
    code: TRPC_ERROR_CODES_BY_KEY[visible.code],
    data,
  };
}

/** Log category: the lowercased code; 500s match the API's `internal_error`. */
export function errorCategory(error: TRPCError): string {
  const { code } = publicError(error);
  return code === "INTERNAL_SERVER_ERROR"
    ? "internal_error"
    : code.toLowerCase();
}
