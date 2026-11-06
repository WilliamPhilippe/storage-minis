// Popup or redirect, in-app browsers and sign-in failures (sign-in plan
// SI-11).

export interface SignInContext {
  /** The Firebase web config's authDomain. */
  readonly authDomain: string;
  /** The page's `location.host`. */
  readonly host: string;
  /** Whether `(pointer: coarse)` matches: phones and tablets. */
  readonly coarsePointer: boolean;
}

export type SignInMethod = "popup" | "redirect";

/**
 * Redirect needs Firebase's helper on the page's own origin, which the
 * `/__/auth/` proxy provides from PR 4 (SI-18). Until then authDomain is
 * `<project>.firebaseapp.com`, so everyone uses popup.
 */
export function canRedirect(context: SignInContext): boolean {
  return context.authDomain === context.host;
}

/** Redirect only where allowed and the primary pointer is coarse. */
export function chooseSignInMethod(context: SignInContext): SignInMethod {
  return canRedirect(context) && context.coarsePointer ? "redirect" : "popup";
}

// Webviews where Google blocks sign-in (`disallowed_useragent`): Facebook,
// Instagram, LINE, WhatsApp, WeChat, TikTok and Android's WebView marker.
const inAppBrowsers = [
  /FBAN/,
  /FBAV/,
  /Instagram/,
  /Line\//,
  /WhatsApp/,
  /MicroMessenger/,
  /TikTok/,
  /; wv\)/,
];

/** The Login page shows state 3 instead of the Google button. */
export function isInAppBrowser(userAgent: string): boolean {
  return inAppBrowsers.some((pattern) => pattern.test(userAgent));
}

export type SignInFailure = "popupBlocked" | "cancelled" | "network" | "other";

/** Maps a Firebase error to the Login page's alert (SI-11's table). */
export function signInFailure(error: unknown): SignInFailure {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;
  switch (code) {
    case "auth/popup-blocked":
      return "popupBlocked";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "cancelled";
    case "auth/network-request-failed":
      return "network";
    default:
      return "other";
  }
}

// Our own flag, set before leaving for Google, so the Login page shows state
// 2 on return instead of flashing state 1 (not Firebase's internal one).
const redirectingKey = "storage-minis.redirecting";

export function markRedirecting(): void {
  try {
    sessionStorage.setItem(redirectingKey, "1");
  } catch {
    // Without storage, the return shows state 1 until Firebase resolves.
  }
}

export function isRedirecting(): boolean {
  try {
    return sessionStorage.getItem(redirectingKey) === "1";
  } catch {
    return false;
  }
}

export function clearRedirecting(): void {
  try {
    sessionStorage.removeItem(redirectingKey);
  } catch {
    // Nothing was saved.
  }
}
