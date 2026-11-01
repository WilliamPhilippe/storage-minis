import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach } from "vitest";
import { initI18n, switchLanguage } from "../i18n/i18n";
import {
  assertConsolePolicy,
  assertNoUnexpectedFetch,
  installBrowserStubs,
  installConsolePolicy,
  installFetchGuard,
  setViewportWidth,
} from "./harness";

installBrowserStubs();

beforeAll(async () => {
  await initI18n("en-US");
});

beforeEach(async () => {
  installConsolePolicy();
  installFetchGuard();
  setViewportWidth(1024);
  // Also resets <html lang> and the dayjs locale.
  await switchLanguage("en-US");
  localStorage.clear();
});

afterEach(() => {
  // Testing Library cleans up automatically only with Vitest globals.
  cleanup();
  assertNoUnexpectedFetch();
  assertConsolePolicy();
});
