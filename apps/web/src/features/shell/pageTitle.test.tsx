import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import app from "../../i18n/en-US/app";
import { memberAnswer } from "../../test/fakeAuth";
import { documentTitle } from "../../test/names";
import { renderApp } from "../../test/renderApp";

// The first /app page of a visit: the "app" strings load in /app's loader,
// which runs only after the sign-in guard. A guard slower than the router's
// 1 s pending delay renders the shell's pending page while the route is still
// loading; a title computed then would keep the raw key. Its own file, so the
// strings are not loaded yet.
describe("the document title on the first /app page", () => {
  it("names the page once its strings have loaded", async () => {
    renderApp("/app/inventory", {
      fetchSession: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(memberAnswer());
          }, 1200);
        }),
    });
    expect(
      await screen.findByRole(
        "heading",
        { level: 1, name: app.titles.inventory },
        { timeout: 3000 },
      ),
    ).toBeTruthy();
    expect(document.title).toBe(documentTitle(app.titles.inventory));
  });
});
