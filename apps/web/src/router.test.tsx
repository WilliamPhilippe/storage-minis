import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import app from "./i18n/en-US/app";
import catalog from "./i18n/en-US/catalog";
import common from "./i18n/en-US/common";
import { echoResponse, renderApp } from "./test/renderApp";

describe("routes", () => {
  it("redirects / to /app", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(echoResponse())),
    );
    const { router } = renderApp("/");
    expect(
      await screen.findByRole("heading", { level: 1, name: app.titles.home }),
    ).toBeTruthy();
    expect(router.state.location.pathname).toBe("/app");
  });

  it("renders the catalog placeholder with the catalog strings and no shell", async () => {
    renderApp("/catalog/demo");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: catalog.unavailable,
      }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Language: English" }));
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.title).toBe("StorageMinis");
  });

  it("renders the public not-found page without back-office links", async () => {
    renderApp("/nope");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: common.notFound.title,
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("renders the back-office not-found page inside the shell", async () => {
    renderApp("/app/nope");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: common.notFound.title,
      }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: common.notFound.home })
        .getAttribute("href"),
    ).toBe("/app");
    expect(
      screen.getByRole("navigation", { name: app.nav.label }),
    ).toBeTruthy();
  });

  it.each(Object.entries(app.titles).filter(([section]) => section !== "home"))(
    "opens the %s placeholder with its h1 and title",
    async (section, title) => {
      renderApp(`/app/${section}`);
      const main = await screen.findByRole("main");
      await waitFor(() => {
        expect(within(main).getByText(app.placeholder)).toBeTruthy();
      });
      expect(
        screen.getByRole("heading", { level: 1, name: title }),
      ).toBeTruthy();
      expect(document.title).toBe(`${title} · StorageMinis`);
    },
  );
});
