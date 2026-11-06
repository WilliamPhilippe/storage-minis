import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { defineConfig, devices } from "@playwright/test";
import { readDatabaseConfig, requireTestDatabase } from "@storage-minis/db";

// The committed local test database (R3/R9); a value already set in the real
// environment wins. Parsed, not loaded: Playwright passes its own environment
// to both servers, and the API needs only the app role's URL.
const testFile = fileURLToPath(new URL("../../.env.test", import.meta.url));
const testValues = existsSync(testFile)
  ? parseEnv(readFileSync(testFile, "utf8"))
  : {};
const databaseUrl = process.env.DATABASE_URL ?? testValues.DATABASE_URL ?? "";
// The project whose ID tokens the API accepts (sign-in plan SI-03), read like
// DATABASE_URL; only the API receives it.
const firebaseProjectId =
  process.env.FIREBASE_PROJECT_ID ?? testValues.FIREBASE_PROJECT_ID ?? "";
// The test sign-in's opt-in (T02 AU-11): from .env.test only, never from the
// environment, so only this API accepts Playwright's custom tokens.
const testSignIn =
  testValues.AUTH_TEST_SIGN_IN === undefined
    ? {}
    : { AUTH_TEST_SIGN_IN: testValues.AUTH_TEST_SIGN_IN };

// Refuse any database not named *_test before a server starts.
requireTestDatabase(readDatabaseConfig({ DATABASE_URL: databaseUrl }));

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  // `open: "never"`: after a failed run in a terminal, the default serves the
  // report and waits for Ctrl+C.
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    // Every project pins the language and the time zone (W9).
    locale: "en-US",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // Migrates and seeds the test database, mints custom tokens and saves
    // the signed-in session that /app specs reuse (SI-17, PW-13).
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: devices["Desktop Chrome"],
    },
    // Tests tagged @phone or @desktop need that layout and run in one
    // project.
    {
      name: "desktop-chrome",
      use: devices["Desktop Chrome"],
      grepInvert: /@phone/,
      dependencies: ["setup"],
    },
    {
      name: "pixel-7",
      use: devices["Pixel 7"],
      grepInvert: /@desktop/,
      dependencies: ["setup"],
    },
  ],
  // Started in order and stopped in reverse; never reused, so a running
  // `pnpm dev` or a leftover server fails the run instead of being tested.
  webServer: [
    {
      name: "api",
      command: "node --enable-source-maps dist/server.js",
      cwd: "../api",
      url: "http://127.0.0.1:3000/health/ready",
      env: {
        DATABASE_URL: databaseUrl,
        FIREBASE_PROJECT_ID: firebaseProjectId,
        ...testSignIn,
        HOST: "127.0.0.1",
        PORT: "3000",
        LOG_LEVEL: "warn",
        NODE_ENV: "test",
        TZ: "UTC",
      },
      reuseExistingServer: false,
      stdout: "pipe",
      // Compose's 15 s, beyond the API's own 10 s shutdown bound.
      gracefulShutdown: { signal: "SIGTERM", timeout: 15_000 },
    },
    {
      name: "web",
      command: "pnpm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: false,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    },
  ],
});
