import { createDatabase } from "@storage-minis/db";
import type { Database, DatabaseConfig } from "@storage-minis/db";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import type { AppDependencies } from "./app.js";
import type { ApiConfig } from "./config.js";

export const lifecycleLimits = {
  startupMs: 17_000,
  shutdownMs: 10_000,
} as const;

type Signal = "SIGINT" | "SIGTERM";
type Category =
  | "configuration_failed"
  | "database_acquisition_failed"
  | "app_construction_failed"
  | "registration_failed"
  | "app_readiness_failed"
  | "database_readiness_failed"
  | "listen_failed"
  | "http_close_failed"
  | "database_close_failed"
  | "startup_timeout"
  | "shutdown_timeout"
  | "listening";

export interface LifecycleRuntime {
  on: (signal: Signal, listener: () => void) => void;
  removeListener: (signal: Signal, listener: () => void) => void;
  setExitCode: (code: number) => void;
  exit: (code: number) => void;
  report: (category: Category) => void;
}

export interface LifecycleOptions {
  createDatabase?: (config: DatabaseConfig) => Database | Promise<Database>;
  buildApp?: (
    httpConfig: ApiConfig["http"],
    dependencies: AppDependencies,
  ) => FastifyInstance;
  registerRoutes?: (app: FastifyInstance, database: Database) => Promise<void>;
  runtime?: LifecycleRuntime;
}

const processRuntime: LifecycleRuntime = {
  on: (signal, listener) => process.on(signal, listener),
  removeListener: (signal, listener) =>
    process.removeListener(signal, listener),
  setExitCode: (code) => {
    process.exitCode = code;
  },
  exit: (code) => process.exit(code),
  report: (category) => {
    // Never pass an exception, configuration, address or registration input here.
    process.stderr.write(`API lifecycle: ${category}.\n`);
  },
};

/** Explicitly start one owner; importing this module acquires no resources. */
export function startLifecycle(
  readConfig: () => ApiConfig,
  options: LifecycleOptions = {},
) {
  const runtime = options.runtime ?? processRuntime;
  const acquireDatabase = options.createDatabase ?? createDatabase;
  const constructApp = options.buildApp ?? buildApp;
  let database: Database | undefined;
  let app: FastifyInstance | undefined;
  let closing = false;
  let exitCode = 0;
  let cleanup: Promise<number> | undefined;
  let shutdownTimer: ReturnType<typeof setTimeout> | undefined;
  const startupSettled = Promise.withResolvers<void>();
  const closed = Promise.withResolvers<number>();

  function deadline(category: "startup_timeout" | "shutdown_timeout") {
    closing = true;
    exitCode = 1;
    runtime.report(category);
    runtime.setExitCode(1);
    // Node termination also closes DB sockets if draining or pool.end is stuck.
    try {
      app?.server.closeAllConnections();
    } finally {
      runtime.exit(1);
    }
  }

  // Keep watchdogs referenced: a pending startup promise alone cannot keep Node
  // alive, and must not silently escape ownership or the documented exit code.
  const startupTimer = setTimeout(
    () => deadline("startup_timeout"),
    lifecycleLimits.startupMs,
  );

  function close(code = 0): Promise<number> {
    if (cleanup) return cleanup;
    closing = true;
    exitCode = code;
    shutdownTimer = setTimeout(
      () => deadline("shutdown_timeout"),
      lifecycleLimits.shutdownMs,
    );
    cleanup = (async () => {
      // A pending acquisition/registration/readiness/listen must settle before
      // handlers disappear or cleanup can claim it has released every resource.
      await startupSettled.promise;
      let cleanupFailed = false;
      try {
        await app?.close();
      } catch {
        cleanupFailed = true;
        exitCode = 1;
        runtime.report("http_close_failed");
      } finally {
        try {
          await database?.close();
        } catch {
          cleanupFailed = true;
          exitCode = 1;
          runtime.report("database_close_failed");
        }
      }
      clearTimeout(startupTimer);
      clearTimeout(shutdownTimer);
      runtime.removeListener("SIGINT", onInterrupt);
      runtime.removeListener("SIGTERM", onTerminate);
      runtime.setExitCode(exitCode);
      closed.resolve(exitCode);
      if (cleanupFailed) {
        // A rejected close cannot certify resource release. After attempting
        // both owners, terminate rather than leaving a listener/pool alive.
        try {
          app?.server.closeAllConnections();
        } finally {
          runtime.exit(1);
        }
      }
      return exitCode;
    })();
    return cleanup;
  }

  function onInterrupt() {
    void close(130);
  }
  function onTerminate() {
    void close(143);
  }

  // Install both handlers before configuration or the first factory call.
  // Use on (not once) so repeated signals cannot bypass the shared cleanup.
  runtime.on("SIGINT", onInterrupt);
  runtime.on("SIGTERM", onTerminate);

  async function start(): Promise<boolean> {
    let failure: Category = "configuration_failed";
    try {
      if (closing) return false;
      const config = readConfig();
      if (closing) return false;
      failure = "database_acquisition_failed";
      database = await acquireDatabase(config.database);
      if (closing) return false;
      failure = "app_construction_failed";
      app = constructApp(config.http, {
        database,
        isClosing: () => closing,
      });
      if (closing) return false;
      failure = "registration_failed";
      await options.registerRoutes?.(app, database);
      if (closing) return false;
      failure = "app_readiness_failed";
      await app.ready();
      if (closing) return false;
      failure = "database_readiness_failed";
      await database.check();
      if (closing) return false;
      failure = "listen_failed";
      await app.listen({ host: config.http.host, port: config.http.port });
      if (closing) return false;
      clearTimeout(startupTimer);
      runtime.report("listening");
      return true;
    } catch {
      // A check rejected during cancellation is not a second startup failure.
      if (!closing) {
        runtime.report(failure);
        void close(1);
      }
      return false;
    } finally {
      startupSettled.resolve();
    }
  }

  // Defer work until the owner, handlers and promises are fully initialized.
  return {
    started: Promise.resolve().then(start),
    closed: closed.promise,
    close,
  };
}
