import { describe, expect, it } from "vitest";
import { fakeIdToken } from "../../test/fakeAuth";
import {
  checkSavedSession,
  isPastLimit,
  readSavedUser,
  savedUserKey,
  sessionLimitSeconds,
  tokenAuthTime,
} from "./savedSession";

const apiKey = "AIzaSyBLhvp2F6AN1sPa4KOJo-vp5w3R4m_3SJc";
const now = Date.UTC(2026, 10, 6, 12, 0, 0);
const nowSeconds = now / 1000;

// The shape @firebase/auth 1.13.9 (firebase 13.2.0) saves: UserImpl.toJSON()
// of a Google sign-in, with the IndexedDB entry around it.
function savedGoogleUser(authTime: number) {
  return {
    uid: "kX2pQ8f3TbYc9WvN1mZr4LsH7aE5",
    email: "owner@example.com",
    emailVerified: true,
    displayName: "Owner",
    isAnonymous: false,
    photoURL: "https://lh3.googleusercontent.com/a/photo",
    providerData: [
      {
        providerId: "google.com",
        uid: "104857600000000000000",
        displayName: "Owner",
        email: "owner@example.com",
        phoneNumber: null,
        photoURL: "https://lh3.googleusercontent.com/a/photo",
      },
    ],
    stsTokenManager: {
      refreshToken: "AMf-vBx-refresh-token",
      accessToken: fakeIdToken({
        uid: "kX2pQ8f3TbYc9WvN1mZr4LsH7aE5",
        email: "owner@example.com",
        authTime,
      }),
      expirationTime: now + 1_800_000,
    },
    createdAt: "1762300000000",
    lastLoginAt: String(authTime * 1000),
    apiKey,
    appName: "[DEFAULT]",
  };
}

describe("reading Firebase's saved user", () => {
  it("uses Firebase's key for the default app", () => {
    expect(savedUserKey(apiKey)).toBe(
      "firebase:authUser:AIzaSyBLhvp2F6AN1sPa4KOJo-vp5w3R4m_3SJc:[DEFAULT]",
    );
  });

  it("decodes the uid and the access token's auth_time", () => {
    expect(readSavedUser(savedGoogleUser(nowSeconds - 60))).toEqual({
      uid: "kX2pQ8f3TbYc9WvN1mZr4LsH7aE5",
      authTime: nowSeconds - 60,
    });
  });

  it("reads a custom-token test user, which has no email", () => {
    const user = {
      uid: "e2e-owner",
      emailVerified: false,
      isAnonymous: false,
      providerData: [],
      stsTokenManager: {
        refreshToken: "r",
        accessToken: fakeIdToken({
          uid: "e2e-owner",
          email: null,
          authTime: 100,
        }),
        expirationTime: 1,
      },
      apiKey,
      appName: "[DEFAULT]",
    };
    expect(readSavedUser(user)).toEqual({ uid: "e2e-owner", authTime: 100 });
  });

  it.each([
    ["nothing", undefined],
    ["text", "user"],
    ["no uid", { stsTokenManager: savedGoogleUser(1).stsTokenManager }],
    ["no token manager", { uid: "u" }],
    ["no access token", { uid: "u", stsTokenManager: {} }],
    [
      "a token that isn't a JWT",
      { uid: "u", stsTokenManager: { accessToken: "abc" } },
    ],
    [
      "a payload that isn't JSON",
      { uid: "u", stsTokenManager: { accessToken: "a.bm90IGpzb24.c" } },
    ],
  ])("treats %s as unreadable", (_case, user) => {
    expect(readSavedUser(user)).toBeUndefined();
  });

  it.each([
    ["a string", "1700000000"],
    ["a fraction", 1.5],
    ["zero", 0],
  ])("refuses an auth_time that is %s", (_case, authTime) => {
    const payload = btoa(JSON.stringify({ auth_time: authTime }));
    expect(tokenAuthTime(`h.${payload}.s`)).toBeUndefined();
  });
});

describe("the 7-day limit", () => {
  it("is 604,800 seconds, as the API's", () => {
    expect(sessionLimitSeconds).toBe(604_800);
  });

  it("accepts exactly 7 days and refuses one second more", () => {
    expect(isPastLimit(nowSeconds - 604_800, now)).toBe(false);
    expect(isPastLimit(nowSeconds - 604_801, now)).toBe(true);
  });

  it("accepts 3 days (AU-12 case 9)", () => {
    expect(isPastLimit(nowSeconds - 3 * 86_400, now)).toBe(false);
  });
});

// jsdom has no IndexedDB, so these cover Firebase's localStorage fallback;
// Playwright covers IndexedDB.
describe("the startup check with localStorage", () => {
  const key = savedUserKey(apiKey);

  it("finds no session in an empty browser", async () => {
    expect(await checkSavedSession(apiKey, now)).toEqual({ status: "none" });
  });

  it("keeps a session within the limit", async () => {
    localStorage.setItem(
      key,
      JSON.stringify(savedGoogleUser(nowSeconds - 3600)),
    );
    expect(await checkSavedSession(apiKey, now)).toEqual({
      status: "valid",
      uid: "kX2pQ8f3TbYc9WvN1mZr4LsH7aE5",
      authTime: nowSeconds - 3600,
    });
    expect(localStorage.getItem(key)).not.toBeNull();
  });

  it("deletes a session past the limit (AU-12 case 10)", async () => {
    localStorage.setItem(
      key,
      JSON.stringify(savedGoogleUser(nowSeconds - 8 * 86_400)),
    );
    expect(await checkSavedSession(apiKey, now)).toEqual({ status: "ended" });
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("deletes a record it can't read", async () => {
    localStorage.setItem(key, "{not json");
    expect(await checkSavedSession(apiKey, now)).toEqual({ status: "ended" });
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("leaves other keys alone", async () => {
    localStorage.setItem("storage-minis.language", "pt-BR");
    localStorage.setItem(
      savedUserKey("AIzaSyAvbSTh4RONUFvo-IWspa43HCOPPXH0vy4"),
      "{not json",
    );
    expect(await checkSavedSession(apiKey, now)).toEqual({ status: "none" });
    expect(localStorage.length).toBe(2);
  });
});
