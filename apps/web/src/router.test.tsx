import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import app from "./i18n/en-US/app";
import catalog from "./i18n/en-US/catalog";
import common from "./i18n/en-US/common";
import login from "./i18n/en-US/login";
import { languageCodes } from "./i18n/i18n";
import { memberAnswer, outsiderUser } from "./test/fakeAuth";
import { documentTitle, languageSwitchName } from "./test/names";
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
    expect(
      screen.getByRole("button", { name: languageSwitchName() }).textContent,
    ).toBe(languageCodes["en-US"]);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.title).toBe(common.brand);
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
      expect(document.title).toBe(documentTitle(title));
    },
  );
});

// The /app guard and the Login page's own check (sign-in plan SI-12).
describe("the sign-in guard", () => {
  async function findHeading(name: string) {
    return screen.findByRole("heading", { level: 1, name });
  }

  it("sends a signed-out visitor to /login, keeping the page they asked for", async () => {
    const { router } = renderApp("/app/sales?page=2", { user: null });
    expect(await findHeading(login.title)).toBeTruthy();
    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.location.search).toEqual({
      redirect: "/app/sales?page=2",
    });
  });

  it("sends a member from /login to /app", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(echoResponse())),
    );
    const { router } = renderApp("/login");
    expect(await findHeading(app.titles.home)).toBeTruthy();
    expect(router.state.location.pathname).toBe("/app");
  });

  it("sends a member to the page in `redirect`", async () => {
    const { router } = renderApp("/login?redirect=%2Fapp%2Fsales");
    expect(await findHeading(app.titles.sales)).toBeTruthy();
    expect(router.state.location.pathname).toBe("/app/sales");
  });

  it("ignores a `redirect` outside /app", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(echoResponse())),
    );
    const { router } = renderApp(
      "/login?redirect=https%3A%2F%2Fexample.com%2Fapp",
    );
    expect(await findHeading(app.titles.home)).toBeTruthy();
    expect(router.state.location.href).toBe("/app");
  });

  it("signs a Google account without access out, to the Login page (AU-10)", async () => {
    const { router, session, auth } = renderApp("/app/inventory", {
      user: outsiderUser(),
      fetchSession: () => Promise.resolve({ status: "noAccess" }),
    });
    expect(await findHeading(login.title)).toBeTruthy();
    expect(router.state.location.href).toBe("/login");
    expect(auth.port.signOut).toHaveBeenCalledTimes(1);
    expect(session.getNotice()).toEqual({
      kind: "noAccess",
      email: "outsider@example.com",
    });
  });

  it("puts the member session in the /app routes' context", async () => {
    const { router } = renderApp("/app/inventory");
    await findHeading(app.titles.inventory);
    const answer = memberAnswer();
    const appMatch = router.state.matches.find(
      (match) => match.routeId === "/app",
    );
    expect(appMatch?.context.member.user).toEqual(
      answer.status === "member" ? answer.user : undefined,
    );
    expect(appMatch?.context.member.organization.id).toBe(7);
  });

  it("follows a sign-out in another tab to /login (AU-04)", async () => {
    const { router, auth, queryClient } = renderApp("/app/inventory");
    await findHeading(app.titles.inventory);
    act(() => {
      auth.setUser(null);
    });
    expect(await findHeading(login.title)).toBeTruthy();
    expect(router.state.location.pathname).toBe("/login");
    expect(queryClient.getQueryCache().getAll()).toEqual([]);
  });

  it("never loads Firebase for the catalog", async () => {
    const { auth } = renderApp("/catalog/demo");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: catalog.unavailable,
      }),
    ).toBeTruthy();
    expect(auth.port.ready).not.toHaveBeenCalled();
  });
});
