import { createDatabase, requireTestDatabase } from "@storage-minis/db";
import { setTimeout as delay } from "node:timers/promises";

// Source types keep offline checking independent of an earlier API build.
// Computed URLs still execute only the compiled production modules at runtime.
const { buildApp } = (await import(
  new URL("../../dist/app.js", import.meta.url).href
)) as typeof import("../../src/app.js");
const { readApiConfig } = (await import(
  new URL("../../dist/config.js", import.meta.url).href
)) as typeof import("../../src/config.js");
const { startLifecycle } = (await import(
  new URL("../../dist/lifecycle.js", import.meta.url).href
)) as typeof import("../../src/lifecycle.js");

// Test entry only: native Node consumes the compiled production lifecycle.
// This file is excluded from dist and the production package/image. Copy
// this exact entry at the same relative path in stopped disposable containers.
const config = readApiConfig(process.env);
requireTestDatabase(config.database);
const mode = process.argv[2] ?? "drain";
const marker = (value = "") => {
  process.stderr.write(`Shutdown fixture: ${value}.\n`);
};

startLifecycle(() => config, {
  createDatabase(databaseConfig) {
    const database = createDatabase(databaseConfig);
    const check = database.check.bind(database);
    let startupCheck = true;
    // The lifecycle's first check is its startup DB-readiness phase, which no
    // Fastify plugin timeout bounds: only the 17 s/10 s watchdogs end it.
    database.check = async () => {
      await check();
      if (!startupCheck || !mode.startsWith("startup")) return;
      startupCheck = false;
      marker("startup_pending");
      if (mode === "startup-finite") await delay(500);
      else await new Promise(() => {});
      marker("startup_settled");
    };
    const close = database.close.bind(database);
    database.close = async () => {
      marker("database_close");
      if (mode === "hang-database") await new Promise(() => {});
      if (mode === "fail-database") throw new Error("fixture");
      await close();
      marker("database_closed");
    };
    return database;
  },
  // Wraps the production composition root; it adds a test route and hook only.
  buildApp(httpConfig, dependencies) {
    const app = buildApp(httpConfig, dependencies);
    app.addHook("onClose", async () => {
      marker("http_close");
      if (mode === "fail-http") throw new Error("fixture");
      if (mode === "hang-http") await new Promise(() => {});
    });
    app.get("/fixture/drain", async () => {
      marker("request_started");
      await delay(6_000);
      marker("request_finished");
      return { drained: true };
    });
    return app;
  },
});
