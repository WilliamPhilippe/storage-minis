import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import common from "../../i18n/en-US/common";
import { expectConsole } from "../../test/harness";
import { echoResponse, renderApp } from "../../test/renderApp";

// The /app strings fail to load, as a chunk would offline.
vi.mock("../../i18n/en-US/app", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

describe("the document title when /app fails", () => {
  it("falls back to the brand instead of a raw title key", async () => {
    expectConsole("warn", /Error in route match/);
    expectConsole("error", /The above error occurred in/);
    // The home loader runs in parallel with the failing /app loader.
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(echoResponse())),
    );
    renderApp("/app");

    expect(await screen.findByText(common.errors.page)).toBeTruthy();
    expect(document.title).toBe(common.brand);
  });
});
