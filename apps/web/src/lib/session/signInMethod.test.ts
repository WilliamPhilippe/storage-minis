import { describe, expect, it } from "vitest";
import {
  canRedirect,
  chooseSignInMethod,
  clearRedirecting,
  isInAppBrowser,
  isRedirecting,
  markRedirecting,
  signInFailure,
} from "./signInMethod";

describe("popup or redirect", () => {
  const dev = {
    authDomain: "storage-minis-dev.firebaseapp.com",
    host: "localhost:5173",
  };
  const proxied = { authDomain: "app.example.com", host: "app.example.com" };

  it("uses popup in development, phones included", () => {
    expect(chooseSignInMethod({ ...dev, coarsePointer: false })).toBe("popup");
    expect(chooseSignInMethod({ ...dev, coarsePointer: true })).toBe("popup");
    expect(canRedirect({ ...dev, coarsePointer: true })).toBe(false);
  });

  it("redirects a coarse pointer once authDomain is the page's host (PR 4)", () => {
    expect(chooseSignInMethod({ ...proxied, coarsePointer: true })).toBe(
      "redirect",
    );
  });

  it("keeps popup for a fine pointer even then", () => {
    expect(chooseSignInMethod({ ...proxied, coarsePointer: false })).toBe(
      "popup",
    );
    expect(canRedirect({ ...proxied, coarsePointer: false })).toBe(true);
  });
});

describe("in-app browsers", () => {
  it.each([
    [
      "Instagram",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 380.0.0.27.82",
    ],
    [
      "Facebook (FBAN)",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/500.0.0.0]",
    ],
    [
      "Facebook (FBAV)",
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/500.0.0.0;]",
    ],
    [
      "LINE",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/14.10.0",
    ],
    [
      "WhatsApp",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.25.10",
    ],
    [
      "WeChat",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50",
    ],
    [
      "TikTok",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_38.0 TikTok",
    ],
    [
      "an Android WebView",
      "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36",
    ],
  ])("detects %s", (_name, userAgent) => {
    expect(isInAppBrowser(userAgent)).toBe(true);
  });

  it.each([
    [
      "Chrome on Android",
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36",
    ],
    [
      "Safari on iPhone",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1",
    ],
    [
      "Chrome on a desktop",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    ],
  ])("lets %s sign in", (_name, userAgent) => {
    expect(isInAppBrowser(userAgent)).toBe(false);
  });
});

describe("sign-in failures", () => {
  it.each([
    ["auth/popup-blocked", "popupBlocked"],
    ["auth/popup-closed-by-user", "cancelled"],
    ["auth/cancelled-popup-request", "cancelled"],
    ["auth/network-request-failed", "network"],
    ["auth/internal-error", "other"],
  ])("maps %s to %s", (code, failure) => {
    expect(signInFailure({ code })).toBe(failure);
  });

  it("maps anything without a code to other", () => {
    expect(signInFailure(new Error("boom"))).toBe("other");
    expect(signInFailure(undefined)).toBe("other");
  });
});

describe("the redirect flag", () => {
  it("is set before leaving and cleared on return", () => {
    expect(isRedirecting()).toBe(false);
    markRedirecting();
    expect(isRedirecting()).toBe(true);
    expect(sessionStorage.getItem("storage-minis.redirecting")).toBe("1");
    clearRedirecting();
    expect(isRedirecting()).toBe(false);
  });
});
