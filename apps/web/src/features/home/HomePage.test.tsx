import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import app from "../../i18n/en-US/app";
import common from "../../i18n/en-US/common";
import { expectConsole } from "../../test/harness";
import { echoResponse, jsonResponse, renderApp } from "../../test/renderApp";

const reply = app.echo.reply.replace("{{message}}", "ping");

type Fetch = (input: string) => Promise<Response>;

function expectRouteErrorLogs() {
  expectConsole("warn", /Error in route match/);
  expectConsole("error", /The above error occurred in/);
}

describe("the API connection card", () => {
  it("shows the echoed message", async () => {
    const fetchMock = vi.fn<Fetch>(() => Promise.resolve(echoResponse()));
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/app");

    expect(await screen.findByText(reply)).toBeTruthy();
    expect(screen.getByText(app.echo.connected)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toMatch(
      /^\/trpc\/diagnostics\.echo\?input=/,
    );
  });

  it("shows a request error after exactly one request for a 400", async () => {
    expectRouteErrorLogs();
    const fetchMock = vi.fn<Fetch>(() =>
      Promise.resolve(
        jsonResponse(400, {
          error: {
            message: "Invalid request",
            code: -32600,
            data: { code: "BAD_REQUEST", httpStatus: 400 },
          },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/app");

    expect(await screen.findByText(common.errors.request)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows the network error after the retries", async () => {
    expectRouteErrorLogs();
    const fetchMock = vi.fn<Fetch>(() =>
      Promise.reject(new TypeError("Failed to fetch")),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/app");

    expect(await screen.findByText(common.errors.network)).toBeTruthy();
    // The first request and TanStack's 3 retries.
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("recovers through Try again once the API answers", async () => {
    expectRouteErrorLogs();
    const user = userEvent.setup();
    const fetchMock = vi.fn<Fetch>(() =>
      Promise.reject(new TypeError("Failed to fetch")),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderApp("/app");
    expect(await screen.findByText(common.errors.network)).toBeTruthy();

    fetchMock.mockImplementation(() => Promise.resolve(echoResponse()));
    await user.click(
      screen.getByRole("button", { name: common.actions.tryAgain }),
    );

    expect(await screen.findByText(reply)).toBeTruthy();
    expect(screen.queryByText(common.errors.network)).toBeNull();
  });
});
