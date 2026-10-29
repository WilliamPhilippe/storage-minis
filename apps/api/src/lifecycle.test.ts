import { EventEmitter } from "node:events";
import type { Database } from "@storage-minis/db";
import type { FastifyInstance, FastifyListenOptions } from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "./app.js";
import type { ApiConfig } from "./config.js";
import { lifecycleLimits, startLifecycle } from "./lifecycle.js";
import type { LifecycleOptions, LifecycleRuntime } from "./lifecycle.js";

const config: ApiConfig = {
  http: {
    host: "127.0.0.1",
    port: 3000,
    logLevel: "silent",
    nodeEnv: "test",
  },
  database: {
    target: "test",
    host: "postgres_test",
    port: 5432,
    database: "storage_minis_test",
    user: "postgres",
    password: "SECRET_PASSWORD_SENTINEL",
  },
};
const hostile = new Error("SECRET_PASSWORD_SENTINEL SQL STACK SENTINEL", {
  cause: new Error("SECRET_CAUSE_SENTINEL"),
});

function fixture() {
  const order: string[] = [];
  const signals = new EventEmitter();
  const runtime = {
    on: vi.fn<LifecycleRuntime["on"]>((signal, listener) => {
      order.push(`on:${signal}`);
      signals.on(signal, listener);
    }),
    removeListener: vi.fn<LifecycleRuntime["removeListener"]>(
      (signal, listener) => {
        signals.removeListener(signal, listener);
      },
    ),
    setExitCode: vi.fn<LifecycleRuntime["setExitCode"]>(),
    exit: vi.fn<LifecycleRuntime["exit"]>(),
    report: vi.fn<LifecycleRuntime["report"]>(),
  };
  // Only the factories below are injected. No client, socket or process handler
  // is acquired; production callbacks still receive the full Database/App types.
  const database = {
    db: {} as Database["db"],
    healthy: false,
    check: vi.fn<Database["check"]>(() => {
      order.push("database.check");
      return Promise.resolve();
    }),
    close: vi.fn<Database["close"]>(() => {
      order.push("database.close");
      return Promise.resolve();
    }),
  };
  const app = {
    ready: vi.fn<() => Promise<void>>(() => {
      order.push("app.ready");
      return Promise.resolve();
    }),
    listen: vi.fn<(input: unknown) => Promise<string>>(() => {
      order.push("app.listen");
      return Promise.resolve("http://127.0.0.1:3000");
    }),
    close: vi.fn<() => Promise<void>>(() => {
      order.push("app.close");
      return Promise.resolve();
    }),
    server: { closeAllConnections: vi.fn() },
  };
  const fullApp = app as unknown as FastifyInstance;
  const readConfig = vi.fn(() => {
    order.push("config");
    return config;
  });
  const createDatabase = vi.fn<NonNullable<LifecycleOptions["createDatabase"]>>(
    () => {
      order.push("database.create");
      return database;
    },
  );
  const constructApp = vi.fn<NonNullable<LifecycleOptions["buildApp"]>>(() => {
    order.push("app.build");
    return fullApp;
  });
  const registerRoutes = vi.fn<NonNullable<LifecycleOptions["registerRoutes"]>>(
    () => {
      order.push("register");
      return Promise.resolve();
    },
  );
  function start(overrides: LifecycleOptions = {}) {
    return startLifecycle(readConfig, {
      runtime,
      createDatabase,
      buildApp: constructApp,
      registerRoutes,
      ...overrides,
    });
  }
  return {
    order,
    signals,
    runtime,
    database,
    app,
    fullApp,
    readConfig,
    createDatabase,
    constructApp,
    registerRoutes,
    start,
  };
}

// Control lifecycle deadlines without faking Node HTTP's unref'ed maintenance
// interval or light-my-request's stream immediates in the real-app seam test.
beforeEach(() => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] }));
afterEach(() => {
  try {
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

describe("lifecycle ownership and extension", () => {
  it("installs early handlers and orders the same DB/app through registration, readiness and listen", async () => {
    const f = fixture();
    const owner = f.start();
    expect(f.order).toEqual(["on:SIGINT", "on:SIGTERM"]);
    expect(await owner.started).toBe(true);
    expect(f.order).toEqual([
      "on:SIGINT",
      "on:SIGTERM",
      "config",
      "database.create",
      "app.build",
      "register",
      "app.ready",
      "database.check",
      "app.listen",
    ]);
    expect(f.createDatabase).toHaveBeenCalledExactlyOnceWith(config.database);
    expect(f.constructApp).toHaveBeenCalledTimes(1);
    expect(f.constructApp.mock.calls[0]?.[0]).toBe(config.http);
    expect(f.constructApp.mock.calls[0]?.[1].database).toBe(f.database);
    expect(f.registerRoutes).toHaveBeenCalledExactlyOnceWith(
      f.fullApp,
      f.database,
    );
    expect(f.app.listen).toHaveBeenCalledExactlyOnceWith({
      host: "127.0.0.1",
      port: 3000,
    });
    expect(f.runtime.report).toHaveBeenCalledExactlyOnceWith("listening");
    expect(vi.getTimerCount()).toBe(0);
    const closing = f.constructApp.mock.calls[0]?.[1].isClosing;
    expect(closing?.()).toBe(false);
    const first = owner.close();
    expect(closing?.()).toBe(true);
    expect(owner.close()).toBe(first);
    expect(await first).toBe(0);
    expect(await owner.closed).toBe(0);
    expect(f.order.slice(-2)).toEqual(["app.close", "database.close"]);
    expect(f.app.close).toHaveBeenCalledTimes(1);
    expect(f.database.close).toHaveBeenCalledTimes(1);
    expect(f.signals.eventNames()).toEqual([]);
    expect(f.runtime.exit).not.toHaveBeenCalled();
  });

  it("supports no registration callback", async () => {
    const f = fixture();
    const owner = startLifecycle(f.readConfig, {
      runtime: f.runtime,
      createDatabase: f.createDatabase,
      buildApp: f.constructApp,
    });
    expect(await owner.started).toBe(true);
    expect(f.registerRoutes).not.toHaveBeenCalled();
    await owner.close();
  });

  it("registers an async test route with access to the full owned DB before app readiness", async () => {
    const f = fixture();
    const gate = Promise.withResolvers<void>();
    const registered = Promise.withResolvers<void>();
    let app: FastifyInstance | undefined;
    const owner = f.start({
      buildApp: (http, dependencies) => {
        app = buildApp(http, dependencies);
        // Injection proves the extension seam, never an actual listener/OS signal.
        vi.spyOn<
          { listen: (input: FastifyListenOptions) => Promise<string> },
          "listen"
        >(app, "listen").mockResolvedValue("unused");
        return app;
      },
      registerRoutes: async (target, db) => {
        expect(db).toBe(f.database);
        target.get("/extension", async () => {
          await db.check();
          return {
            sameDatabase: db === f.database,
            sameDrizzle: db.db === f.database.db,
          };
        });
        registered.resolve();
        await gate.promise;
      },
    });
    try {
      await registered.promise;
      expect(app?.server.listening).toBe(false);
      expect(f.database.check).not.toHaveBeenCalled();
      gate.resolve();
      expect(await owner.started).toBe(true);
      const response = await app?.inject("/extension");
      expect(response?.statusCode).toBe(200);
      expect(response?.json()).toEqual({
        sameDatabase: true,
        sameDrizzle: true,
      });
      expect(f.database.check).toHaveBeenCalledTimes(2);
    } finally {
      gate.resolve();
      await owner.close();
    }
  });
});

describe("partial startup failures", () => {
  it.each([
    ["configuration", "configuration_failed", 0, 0],
    ["acquisition", "database_acquisition_failed", 0, 0],
    ["construction", "app_construction_failed", 0, 1],
    ["registration", "registration_failed", 1, 1],
    ["app readiness", "app_readiness_failed", 1, 1],
    ["DB readiness", "database_readiness_failed", 1, 1],
    ["listen", "listen_failed", 1, 1],
  ] as const)(
    "cleans acquired resources after %s failure with safe diagnostics",
    async (phase, category, appCloses, dbCloses) => {
      const f = fixture();
      switch (phase) {
        case "configuration":
          f.readConfig.mockImplementation(() => {
            throw hostile;
          });
          break;
        case "acquisition":
          f.createDatabase.mockImplementation(() => {
            throw hostile;
          });
          break;
        case "construction":
          f.constructApp.mockImplementation(() => {
            throw hostile;
          });
          break;
        case "registration":
          f.registerRoutes.mockRejectedValue(hostile);
          break;
        case "app readiness":
          f.app.ready.mockRejectedValue(hostile);
          break;
        case "DB readiness":
          f.database.check.mockRejectedValue(hostile);
          break;
        case "listen":
          f.app.listen.mockRejectedValue(hostile);
          break;
      }
      const owner = f.start();
      expect(await owner.started).toBe(false);
      expect(await owner.closed).toBe(1);
      expect(f.app.close).toHaveBeenCalledTimes(appCloses);
      expect(f.database.close).toHaveBeenCalledTimes(dbCloses);
      expect(f.runtime.report.mock.calls).toEqual([[category]]);
      expect(f.runtime.setExitCode).toHaveBeenLastCalledWith(1);
      expect(f.runtime.exit).not.toHaveBeenCalled();
      expect(f.signals.eventNames()).toEqual([]);
      if (phase !== "listen") expect(f.app.listen).not.toHaveBeenCalled();
    },
  );

  it("cleans after rejected async acquisition without claiming an unacquired DB", async () => {
    const f = fixture();
    f.createDatabase.mockRejectedValue(hostile);
    const owner = f.start();
    expect(await owner.started).toBe(false);
    expect(await owner.closed).toBe(1);
    expect(f.database.close).not.toHaveBeenCalled();
    expect(f.constructApp).not.toHaveBeenCalled();
  });
});

describe("signals, cancellation and cleanup", () => {
  it.each([
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const)(
    "shares cleanup for repeated %s/mixed signals and returns %s",
    async (signal, code) => {
      const f = fixture();
      const gate = Promise.withResolvers<void>();
      f.app.close.mockReturnValue(gate.promise);
      const owner = f.start();
      expect(await owner.started).toBe(true);
      f.signals.emit(signal);
      f.signals.emit("SIGTERM");
      f.signals.emit("SIGINT");
      const closing = owner.close(1);
      expect(owner.close()).toBe(closing);
      await vi.advanceTimersByTimeAsync(0);
      expect(f.app.close).toHaveBeenCalledTimes(1);
      expect(f.database.close).not.toHaveBeenCalled();
      expect(f.signals.listenerCount("SIGTERM")).toBe(1);
      gate.resolve();
      expect(await owner.closed).toBe(code);
      expect(await closing).toBe(code);
      expect(f.database.close).toHaveBeenCalledTimes(1);
      expect(f.signals.eventNames()).toEqual([]);
    },
  );

  it("can cancel immediately before configuration or acquisition", async () => {
    const f = fixture();
    const owner = f.start();
    f.signals.emit("SIGINT");
    expect(await owner.started).toBe(false);
    expect(await owner.closed).toBe(130);
    expect(f.readConfig).not.toHaveBeenCalled();
    expect(f.createDatabase).not.toHaveBeenCalled();
  });

  it.each([
    "acquisition",
    "registration",
    "app readiness",
    "DB readiness",
    "listen",
  ] as const)(
    "retains ownership until pending %s settles after cancellation",
    async (phase) => {
      const f = fixture();
      const pending = Promise.withResolvers<void>();
      const entered = Promise.withResolvers<void>();
      async function block() {
        entered.resolve();
        await pending.promise;
      }
      switch (phase) {
        case "acquisition":
          f.createDatabase.mockImplementation(async () => {
            await block();
            return f.database;
          });
          break;
        case "registration":
          f.registerRoutes.mockImplementation(block);
          break;
        case "app readiness":
          f.app.ready.mockImplementation(block);
          break;
        case "DB readiness":
          f.database.check.mockImplementation(block);
          break;
        case "listen":
          f.app.listen.mockImplementation(async () => {
            await block();
            return "unused";
          });
          break;
      }
      const owner = f.start();
      await entered.promise;
      f.signals.emit("SIGTERM");
      f.signals.emit("SIGINT");
      await vi.advanceTimersByTimeAsync(0);
      expect(f.runtime.removeListener).not.toHaveBeenCalled();
      expect(f.database.close).not.toHaveBeenCalled();
      pending.resolve();
      expect(await owner.started).toBe(false);
      expect(await owner.closed).toBe(143);
      expect(f.database.close).toHaveBeenCalledTimes(1);
      expect(f.app.close).toHaveBeenCalledTimes(
        phase === "acquisition" ? 0 : 1,
      );
      expect(f.app.listen).toHaveBeenCalledTimes(phase === "listen" ? 1 : 0);
      expect(f.runtime.report).not.toHaveBeenCalled();
      expect(f.signals.eventNames()).toEqual([]);
    },
  );

  it("handles rejection of pending startup after cancellation", async () => {
    const f = fixture();
    const gate = Promise.withResolvers<Database>();
    f.createDatabase.mockReturnValue(gate.promise);
    const owner = f.start();
    await vi.advanceTimersByTimeAsync(0);
    f.signals.emit("SIGTERM");
    gate.reject(hostile);
    expect(await owner.started).toBe(false);
    expect(await owner.closed).toBe(143);
    expect(f.constructApp).not.toHaveBeenCalled();
    expect(f.runtime.report).not.toHaveBeenCalled();
  });

  it.each(["HTTP", "DB", "both"] as const)(
    "returns failure for %s close rejection and always attempts the pool",
    async (phase) => {
      const f = fixture();
      if (phase !== "DB") f.app.close.mockRejectedValue(hostile);
      if (phase !== "HTTP") f.database.close.mockRejectedValue(hostile);
      const owner = f.start();
      expect(await owner.started).toBe(true);
      f.signals.emit("SIGTERM");
      expect(await owner.closed).toBe(1);
      expect(f.app.close).toHaveBeenCalledTimes(1);
      expect(f.database.close).toHaveBeenCalledTimes(1);
      expect(f.runtime.report.mock.calls).toEqual([
        ["listening"],
        ...(phase !== "DB" ? [["http_close_failed"]] : []),
        ...(phase !== "HTTP" ? [["database_close_failed"]] : []),
      ]);
      expect(f.runtime.setExitCode).toHaveBeenLastCalledWith(1);
      expect(f.runtime.exit).toHaveBeenCalledExactlyOnceWith(1);
      expect(f.app.server.closeAllConnections).toHaveBeenCalledTimes(1);
    },
  );
});

describe("deadline enforcement with virtual time (no OS proof)", () => {
  it("bounds cancellation during pending acquisition and still owns a late DB", async () => {
    const f = fixture();
    const acquisition = Promise.withResolvers<Database>();
    f.createDatabase.mockReturnValue(acquisition.promise);
    const owner = f.start();
    await vi.advanceTimersByTimeAsync(0);
    f.signals.emit("SIGTERM");
    await vi.advanceTimersByTimeAsync(lifecycleLimits.shutdownMs - 1);
    expect(f.runtime.exit).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(f.runtime.exit).toHaveBeenCalledExactlyOnceWith(1);
    expect(f.runtime.report).toHaveBeenCalledExactlyOnceWith(
      "shutdown_timeout",
    );
    expect(f.runtime.removeListener).not.toHaveBeenCalled();
    acquisition.resolve(f.database);
    expect(await owner.started).toBe(false);
    expect(await owner.closed).toBe(1);
    expect(f.database.close).toHaveBeenCalledTimes(1);
    expect(f.constructApp).not.toHaveBeenCalled();
  });

  it("does not replace a startup failure with later signal exit codes during cleanup", async () => {
    const f = fixture();
    const draining = Promise.withResolvers<void>();
    f.registerRoutes.mockRejectedValue(hostile);
    f.app.close.mockReturnValue(draining.promise);
    const owner = f.start();
    expect(await owner.started).toBe(false);
    f.signals.emit("SIGTERM");
    f.signals.emit("SIGINT");
    draining.resolve();
    expect(await owner.closed).toBe(1);
    expect(f.app.close).toHaveBeenCalledTimes(1);
    expect(f.database.close).toHaveBeenCalledTimes(1);
    expect(f.runtime.exit).not.toHaveBeenCalled();
  });

  it("forces failed startup at 17s even if registration is stuck", async () => {
    const f = fixture();
    const gate = Promise.withResolvers<void>();
    f.registerRoutes.mockReturnValue(gate.promise);
    const owner = f.start();
    await vi.advanceTimersByTimeAsync(lifecycleLimits.startupMs - 1);
    expect(f.runtime.exit).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(f.app.server.closeAllConnections).toHaveBeenCalledTimes(1);
    expect(f.runtime.exit).toHaveBeenCalledExactlyOnceWith(1);
    expect(f.runtime.report).toHaveBeenCalledExactlyOnceWith("startup_timeout");
    expect(f.signals.listenerCount("SIGTERM")).toBe(1);
    // Mock exit returns; settle the fixture to release its handlers/timers.
    gate.resolve();
    expect(await owner.started).toBe(false);
    expect(await owner.close(1)).toBe(1);
    expect(f.app.listen).not.toHaveBeenCalled();
  });

  it("keeps the startup/failure bound armed during failed-start cleanup", async () => {
    const f = fixture();
    const registration = Promise.withResolvers<void>();
    const draining = Promise.withResolvers<void>();
    f.registerRoutes.mockReturnValue(registration.promise);
    f.app.close.mockReturnValue(draining.promise);
    const owner = f.start();
    await vi.advanceTimersByTimeAsync(8_000);
    registration.reject(hostile);
    expect(await owner.started).toBe(false);
    await vi.advanceTimersByTimeAsync(8_999);
    expect(f.runtime.exit).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(f.runtime.report).toHaveBeenLastCalledWith("startup_timeout");
    expect(f.runtime.exit).toHaveBeenCalledExactlyOnceWith(1);
    draining.resolve();
    expect(await owner.closed).toBe(1);
  });

  it.each(["HTTP", "DB"] as const)(
    "forces exit 1 when %s cleanup blocks, with one total 10s budget",
    async (phase) => {
      const f = fixture();
      const http = Promise.withResolvers<void>();
      const db = Promise.withResolvers<void>();
      f.app.close.mockReturnValue(http.promise);
      f.database.close.mockReturnValue(db.promise);
      const owner = f.start();
      expect(await owner.started).toBe(true);
      f.signals.emit("SIGINT");
      await vi.advanceTimersByTimeAsync(6_000);
      if (phase === "DB") http.resolve();
      await vi.advanceTimersByTimeAsync(3_999);
      expect(f.runtime.exit).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(f.app.server.closeAllConnections).toHaveBeenCalledTimes(1);
      expect(f.runtime.report).toHaveBeenLastCalledWith("shutdown_timeout");
      expect(f.runtime.exit).toHaveBeenCalledExactlyOnceWith(1);
      http.resolve();
      db.resolve();
      expect(await owner.closed).toBe(1);
      expect(f.database.close).toHaveBeenCalledTimes(1);
    },
  );
});
