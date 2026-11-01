/**
 * Allowlisted error logging (owner-approved 2026-11-01). Client responses stay
 * fixed; logs keep what diagnoses a failure without carrying secrets or inputs.
 *
 * Only these fields are ever read from an error: its constructor name, a
 * code (Node error code or Postgres SQLSTATE), its stack frames and its cause.
 * Messages are added only in development, except for ConfigurationError.
 * Other properties (Postgres detail, a URL parser's input, headers) are never
 * read, so a new library field cannot leak by default.
 */

export interface ErrorLog {
  type: string;
  code?: string;
  message?: string;
  stack?: string;
  cause?: ErrorLog;
}

export interface ErrorLogOptions {
  /** Include messages; true only when NODE_ENV is exactly "development". */
  messages: boolean;
}

/**
 * A configuration failure whose message is written by this API from fixed
 * text naming only variables, never values, so it is logged in every mode.
 */
export class ConfigurationError extends Error {
  override name = "ConfigurationError";
}

export const errorLogLimits = { causeDepth: 3, frames: 20 } as const;

const identifier = /^[A-Za-z_$][\w$]{0,63}$/;
const codePattern = /^[A-Za-z0-9_]{1,64}$/;
const framePattern = /^\s+at\s/;

/** Development mode fails closed: only the exact value enables messages. */
export function isDevelopment(
  environment: Readonly<Record<string, string | undefined>>,
): boolean {
  return environment.NODE_ENV === "development";
}

// Getters and proxies may throw; a failing read yields no field.
function read(value: object, key: string): unknown {
  try {
    return (value as Record<string, unknown>)[key];
  } catch {
    return undefined;
  }
}

function typeName(value: object): string {
  try {
    const name: unknown = value.constructor.name;
    if (typeof name === "string" && identifier.test(name)) return name;
  } catch {
    // Fall through to the generic name.
  }
  return "Object";
}

/**
 * Stack frames only: V8's first lines repeat the message, which may span
 * several lines, so keep just the `at` lines rather than dropping line one.
 */
function frames(value: object): string | undefined {
  const stack = read(value, "stack");
  if (typeof stack !== "string") return undefined;
  const lines = stack
    .split("\n")
    .filter((line) => framePattern.test(line))
    .slice(0, errorLogLimits.frames)
    .map((line) => line.trim());
  return lines.length > 0 ? lines.join("\n") : undefined;
}

export function serializeError(
  error: unknown,
  options: ErrorLogOptions,
  depth = 0,
): ErrorLog {
  if (typeof error !== "object" || error === null) {
    // Never the thrown value itself.
    return { type: error === null ? "null" : typeof error };
  }
  const result: ErrorLog = { type: typeName(error) };
  const code = read(error, "code");
  if (typeof code === "string" && codePattern.test(code)) result.code = code;
  if (options.messages || error instanceof ConfigurationError) {
    const message = read(error, "message");
    if (typeof message === "string") result.message = message;
  }
  const stack = frames(error);
  if (stack !== undefined) result.stack = stack;
  const cause = read(error, "cause");
  if (cause !== undefined && depth < errorLogLimits.causeDepth) {
    result.cause = serializeError(cause, options, depth + 1);
  }
  return result;
}

export type LifecycleCategory =
  | "configuration_failed"
  | "database_acquisition_failed"
  | "app_construction_failed"
  | "app_readiness_failed"
  | "database_readiness_failed"
  | "listen_failed"
  | "http_close_failed"
  | "database_close_failed"
  | "startup_timeout"
  | "shutdown_timeout"
  | "listening";

/**
 * One JSON line shaped like the request logs (Pino levels: 30 info, 50 error).
 * Lifecycle lines never depend on LOG_LEVEL: startup can fail before it is read.
 */
export function lifecycleLine(
  category: LifecycleCategory,
  error: unknown,
  options: ErrorLogOptions,
): string {
  return `${JSON.stringify({
    level: category === "listening" ? 30 : 50,
    time: Date.now(),
    msg: category,
    ...(error === undefined ? {} : { err: serializeError(error, options) }),
  })}\n`;
}
