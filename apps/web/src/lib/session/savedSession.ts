// The startup check (sign-in plan SI-10, T02 AU-03 check 1). It runs once per
// page load, before Firebase initializes, because Firebase refreshes a saved
// session's token before the app sees the user. It reads Firebase's saved
// record and deletes it when its last Google sign-in is past the 7-day limit,
// or when it can't be read, so the app starts signed out and Firebase makes no
// request.
//
// The names and shape below are Firebase internals (@firebase/auth 1.13.9,
// shipped in firebase 13.2.0). The check fails closed: if an upgrade changes
// them, saved sessions are discarded and people sign in again, and every
// signed-in Playwright spec fails at once.

/** AU-03: a session ends 7 days (604,800 s) after its last Google sign-in. */
export const sessionLimitSeconds = 604_800;

const databaseName = "firebaseLocalStorageDb";
const storeName = "firebaseLocalStorage";

export type SavedSession =
  | { readonly status: "none" }
  /** A record was deleted: past the limit, or unreadable. */
  | { readonly status: "ended" }
  | {
      readonly status: "valid";
      readonly uid: string;
      readonly authTime: number;
    };

/** The API's rule: `now − auth_time ≤ 604,800 s` passes. */
export function isPastLimit(authTime: number, nowMs: number): boolean {
  return nowMs / 1000 - authTime > sessionLimitSeconds;
}

/** Firebase's key for the default app's saved user. */
export function savedUserKey(apiKey: string): string {
  return `firebase:authUser:${apiKey}:[DEFAULT]`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const bytes = Uint8Array.from(atob(padded), (character) =>
    character.charCodeAt(0),
  );
  return new TextDecoder().decode(bytes);
}

/** An ID token's `auth_time` claim in seconds, read without verifying it. */
export function tokenAuthTime(token: unknown): number | undefined {
  if (typeof token !== "string") {
    return undefined;
  }
  const payload = token.split(".")[1];
  if (payload === undefined) {
    return undefined;
  }
  try {
    const claims: unknown = JSON.parse(decodeBase64Url(payload));
    const authTime = isRecord(claims) ? claims.auth_time : undefined;
    return typeof authTime === "number" &&
      Number.isSafeInteger(authTime) &&
      authTime > 0
      ? authTime
      : undefined;
  } catch {
    return undefined;
  }
}

/** The saved user's uid and `auth_time`, or undefined when unreadable. */
export function readSavedUser(
  user: unknown,
): { uid: string; authTime: number } | undefined {
  if (!isRecord(user) || typeof user.uid !== "string" || user.uid === "") {
    return undefined;
  }
  const tokens = user.stsTokenManager;
  const authTime = tokenAuthTime(
    isRecord(tokens) ? tokens.accessToken : undefined,
  );
  return authTime === undefined ? undefined : { uid: user.uid, authTime };
}

type Inspection =
  | { readonly status: "none" | "deleted" }
  | {
      readonly status: "valid";
      readonly uid: string;
      readonly authTime: number;
    };

function inspect(user: unknown, nowMs: number): Inspection {
  const saved = readSavedUser(user);
  if (saved === undefined || isPastLimit(saved.authTime, nowMs)) {
    return { status: "deleted" };
  }
  return { status: "valid", ...saved };
}

function settle<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("IndexedDB request failed."));
    };
  });
}

// Opens Firebase's database only if it exists: when `upgradeneeded` fires the
// database is new, and aborting the upgrade keeps it from being created.
function openExistingDatabase(): Promise<IDBDatabase | undefined> {
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(databaseName);
    } catch {
      resolve(undefined);
      return;
    }
    request.onupgradeneeded = () => {
      request.transaction?.abort();
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      event.preventDefault();
      resolve(undefined);
    };
  });
}

async function inspectIndexedDb(
  key: string,
  nowMs: number,
): Promise<Inspection> {
  if (typeof indexedDB === "undefined") {
    return { status: "none" };
  }
  const database = await openExistingDatabase();
  if (database === undefined) {
    return { status: "none" };
  }
  try {
    if (!database.objectStoreNames.contains(storeName)) {
      return { status: "none" };
    }
    const entry: unknown = await settle(
      database.transaction(storeName).objectStore(storeName).get(key),
    );
    if (entry === undefined) {
      return { status: "none" };
    }
    const result = inspect(isRecord(entry) ? entry.value : undefined, nowMs);
    if (result.status === "deleted") {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).delete(key);
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = transaction.onabort = () => {
          reject(transaction.error ?? new Error("IndexedDB delete failed."));
        };
      });
    }
    return result;
  } finally {
    database.close();
  }
}

// Firebase's fallback persistence keeps the same record as JSON text.
function inspectLocalStorage(key: string, nowMs: number): Inspection {
  let text: string | null;
  try {
    text = localStorage.getItem(key);
  } catch {
    return { status: "none" };
  }
  if (text === null) {
    return { status: "none" };
  }
  let user: unknown;
  try {
    user = JSON.parse(text);
  } catch {
    user = undefined;
  }
  const result = inspect(user, nowMs);
  if (result.status === "deleted") {
    localStorage.removeItem(key);
  }
  return result;
}

/**
 * Checks both of Firebase's persistence locations, IndexedDB first, as
 * Firebase reads them. Returns the session Firebase will load, `ended` when
 * a record was deleted and none remains, or `none`.
 */
export async function checkSavedSession(
  apiKey: string,
  nowMs: number = Date.now(),
): Promise<SavedSession> {
  const key = savedUserKey(apiKey);
  const results = [
    await inspectIndexedDb(key, nowMs),
    inspectLocalStorage(key, nowMs),
  ];
  const valid = results.find((result) => result.status === "valid");
  if (valid?.status === "valid") {
    return { status: "valid", uid: valid.uid, authTime: valid.authTime };
  }
  return results.some((result) => result.status === "deleted")
    ? { status: "ended" }
    : { status: "none" };
}
