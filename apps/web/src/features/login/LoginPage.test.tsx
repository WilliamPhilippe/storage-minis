import { screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import app from "../../i18n/en-US/app";
import common from "../../i18n/en-US/common";
import login from "../../i18n/en-US/login";
import { languageCodes, languageNames } from "../../i18n/i18n";
import ptLogin from "../../i18n/pt-BR/login";
import { trpcClient } from "../../lib/trpc";
import { outsiderUser, secondsAgo } from "../../test/fakeAuth";
import { setViewportWidth } from "../../test/harness";
import { languageSwitchName } from "../../test/names";
import { errorResponse, renderApp } from "../../test/renderApp";

const signedOut = { user: null } as const;
// A signed-in member lands on a placeholder page, which makes no request.
const toInventory = "/login?redirect=%2Fapp%2Finventory";

function escape(text: string): RegExp {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

// antd's loading spinner adds "loading" to the button's name.
function findOpeningButton() {
  return screen.findByRole("button", { name: escape(login.opening.action) });
}

function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function fill(template: string, email: string): string {
  return template.replace("{{email}}", email).replace(/<\/?bold>/g, "");
}

describe("state 1: sign in", () => {
  it.each([
    ["phone", 390, true],
    ["desktop", 1280, false],
  ])("shows the page on %s (%i px)", async (_layout, width, largeControls) => {
    setViewportWidth(width);
    renderApp("/login", signedOut);

    expect(
      await screen.findByRole("heading", { level: 1, name: login.title }),
    ).toBeTruthy();
    // The section is labelled by its heading, so it is a named region.
    const section = screen.getByRole("region", { name: login.title });
    const button = within(section).getByRole("button", {
      name: login.action,
    });
    // componentSize: 44px controls below bp-md, 40px from it.
    expect(button.classList.contains("ant-btn-lg")).toBe(largeControls);
    // Google's G, decorative inside the button.
    const mark = button.querySelector("img");
    expect(mark?.getAttribute("src")).toMatch(/google-g\.svg$/);
    expect(mark?.getAttribute("alt")).toBe("");
    expect(screen.getByText(login.lead)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe(login.helper);
    expect(screen.getByText(login.footer)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      screen.getByRole("button", { name: languageSwitchName() }).textContent,
    ).toBe(languageCodes["en-US"]);
    expect(screen.getByRole("img", { name: common.brand })).toBeTruthy();
  });

  it("switches to pt-BR", async () => {
    const user = userEvent.setup();
    renderApp("/login", signedOut);
    await user.click(
      await screen.findByRole("button", { name: languageSwitchName() }),
    );
    await user.click(
      screen.getByRole("menuitem", { name: languageNames["pt-BR"] }),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: ptLogin.title }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: ptLogin.action })).toBeTruthy();
  });

  it("says the session ended when the app signed the person out", async () => {
    renderApp("/login", { user: null, savedSession: { status: "ended" } });
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(login.sessionEnded);
    expect(alert.classList.contains("ant-alert-info")).toBe(true);
  });
});

describe("signing in with Google", () => {
  it("shows state 2 while the popup is open, then sends the member on", async () => {
    const user = userEvent.setup();
    const { router, auth } = renderApp(toInventory, signedOut);
    const popup = deferred();
    const signInWithPopup = auth.port.signInWithPopup.getMockImplementation();
    auth.port.signInWithPopup.mockImplementationOnce(async (options) => {
      await popup.promise;
      await signInWithPopup?.(options);
    });

    await user.click(await screen.findByRole("button", { name: login.action }));
    const button = await findOpeningButton();
    expect(button.classList.contains("ant-btn-loading")).toBe(true);
    expect(screen.getByRole("status").textContent).toBe(login.opening.helper);
    const languageSwitch = screen.getByRole("button", {
      name: languageSwitchName(),
    });
    expect((languageSwitch as HTMLButtonElement).disabled).toBe(true);
    expect(auth.port.signInWithPopup).toHaveBeenCalledWith({
      language: "en-US",
      selectAccount: false,
    });

    popup.resolve();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: app.titles.inventory,
      }),
    ).toBeTruthy();
    expect(router.state.location.pathname).toBe("/app/inventory");
  });

  it.each([
    ["auth/popup-blocked", login.errors.popupBlocked],
    ["auth/popup-closed-by-user", login.errors.cancelled],
    ["auth/cancelled-popup-request", login.errors.cancelled],
    ["auth/network-request-failed", login.errors.network],
    ["auth/internal-error", login.errors.failed],
  ])("shows an alert in state 1 for %s", async (code, text) => {
    const user = userEvent.setup();
    const { router, auth } = renderApp("/login", signedOut);
    auth.port.signInWithPopup.mockRejectedValueOnce({ code });
    await user.click(await screen.findByRole("button", { name: login.action }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(text);
    expect(alert.classList.contains("ant-alert-error")).toBe(true);
    expect(screen.getByRole("button", { name: login.action })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe(login.helper);
    expect(router.state.location.pathname).toBe("/login");
    // Development has no redirect: authDomain isn't the page's host.
    expect(auth.port.signInWithRedirect).not.toHaveBeenCalled();
  });

  it("reports a server that can't answer after Google's sign-in", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          errorResponse(500, "INTERNAL_SERVER_ERROR", "Internal server error"),
        ),
      ),
    );
    renderApp("/login", {
      user: null,
      fetchSession: () => trpcClient.session.get.query(),
    });
    await user.click(await screen.findByRole("button", { name: login.action }));
    expect((await screen.findByRole("alert")).textContent).toBe(
      common.errors.server,
    );
  });

  it("clears the 'session ended' alert when a new sign-in starts", async () => {
    const user = userEvent.setup();
    const { auth } = renderApp("/login", {
      user: null,
      savedSession: { status: "ended" },
    });
    auth.port.signInWithPopup.mockRejectedValueOnce({
      code: "auth/popup-closed-by-user",
    });
    expect((await screen.findByRole("alert")).textContent).toBe(
      login.sessionEnded,
    );
    await user.click(screen.getByRole("button", { name: login.action }));
    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        login.errors.cancelled,
      );
    });
  });
});

describe("state 4: no access", () => {
  async function signInWithoutAccess(email: string | null) {
    const user = userEvent.setup();
    const view = renderApp("/login", {
      user: null,
      fetchSession: () => Promise.resolve({ status: "noAccess" }),
    });
    view.auth.setGoogleUser({ ...outsiderUser(), email });
    await user.click(await screen.findByRole("button", { name: login.action }));
    return { ...view, user };
  }

  it("names the Google account and signs it out of Firebase (AU-10)", async () => {
    const { auth, router } = await signInWithoutAccess("outsider@example.com");
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(login.noAccess.title)).toBeTruthy();
    expect(alert.textContent).toContain(
      fill(login.noAccess.withEmail, "outsider@example.com"),
    );
    expect(within(alert).getByText("outsider@example.com").tagName).toBe(
      "STRONG",
    );
    expect(auth.port.currentUser()).toBeNull();
    expect(router.state.location.pathname).toBe("/login");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("omits the email for a test user without one", async () => {
    await signInWithoutAccess(null);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(login.noAccess.withoutEmail);
  });

  it("starts Google's account chooser from 'Use another Google account'", async () => {
    const { auth, user } = await signInWithoutAccess("outsider@example.com");
    auth.port.signInWithPopup.mockRejectedValueOnce({
      code: "auth/popup-closed-by-user",
    });
    await user.click(
      await screen.findByRole("button", { name: login.noAccess.action }),
    );
    expect(auth.port.signInWithPopup).toHaveBeenLastCalledWith({
      language: "en-US",
      selectAccount: true,
    });
    // A cancelled second try returns to state 1.
    expect((await screen.findByRole("alert")).textContent).toBe(
      login.errors.cancelled,
    );
    expect(screen.getByRole("button", { name: login.action })).toBeTruthy();
  });
});

describe("returning from a redirect sign-in", () => {
  it("shows state 2 at once, then sends the member on", async () => {
    sessionStorage.setItem("storage-minis.redirecting", "1");
    const { router, auth } = renderApp(toInventory, signedOut);
    expect(await findOpeningButton()).toBeTruthy();
    expect(screen.queryByRole("button", { name: login.action })).toBeNull();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: app.titles.inventory,
      }),
    ).toBeTruthy();
    expect(auth.port.completeRedirect).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe("/app/inventory");
    expect(sessionStorage.getItem("storage-minis.redirecting")).toBeNull();
  });

  it("shows the failure in state 1", async () => {
    sessionStorage.setItem("storage-minis.redirecting", "1");
    const { auth } = renderApp("/login", signedOut);
    auth.port.completeRedirect.mockRejectedValueOnce({
      code: "auth/network-request-failed",
    });
    expect((await screen.findByRole("alert")).textContent).toBe(
      login.errors.network,
    );
    expect(screen.getByRole("button", { name: login.action })).toBeTruthy();
    expect(sessionStorage.getItem("storage-minis.redirecting")).toBeNull();
  });
});

describe("state 3: in-app browsers", () => {
  const instagram =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 380.0.0.27.82";

  function stubClipboard(writeText: (text: string) => Promise<void>) {
    const spy = vi.fn(writeText);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: spy },
    });
    onTestFinished(() => {
      Reflect.deleteProperty(navigator, "clipboard");
    });
    return spy;
  }

  it("explains how to open the page in the browser, without the Google button", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(instagram);
    setViewportWidth(390);
    renderApp("/login", signedOut);
    expect(
      await screen.findByRole("heading", { level: 1, name: login.inApp.title }),
    ).toBeTruthy();
    expect(screen.getByText(login.inApp.lead)).toBeTruthy();
    const steps = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual([
      `1${login.inApp.steps.menu.replace(/<\/?bold>/g, "")}`,
      `2${login.inApp.steps.open.replace(/<\/?bold>/g, "")}`,
    ]);
    expect(screen.queryByRole("button", { name: login.action })).toBeNull();
    expect(screen.getByText(`${window.location.host}/login`)).toBeTruthy();
    expect(screen.getByText(login.inApp.footer)).toBeTruthy();
  });

  it("copies the link, with the page to return to", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(instagram);
    // After setup(): user-event installs its own clipboard.
    const user = userEvent.setup();
    const writeText = stubClipboard(() => Promise.resolve());
    renderApp(toInventory, signedOut);
    await user.click(
      await screen.findByRole("button", { name: login.inApp.action }),
    );
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}${toInventory}`,
    );
    expect(await screen.findByText(login.inApp.copied)).toBeTruthy();
  });

  it("says so when the link can't be copied", async () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(instagram);
    const user = userEvent.setup();
    stubClipboard(() => Promise.reject(new Error("NotAllowedError")));
    renderApp("/login", signedOut);
    await user.click(
      await screen.findByRole("button", { name: login.inApp.action }),
    );
    expect(await screen.findByText(login.inApp.copyFailed)).toBeTruthy();
  });
});

describe("the Login page for a signed-in member", () => {
  it("goes on to the page in `redirect`", async () => {
    const { router } = renderApp(toInventory, {
      user: {
        uid: "owner-uid",
        email: "owner@example.com",
        authTime: secondsAgo(60),
      },
    });
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: app.titles.inventory,
      }),
    ).toBeTruthy();
    expect(router.state.location.pathname).toBe("/app/inventory");
  });
});
