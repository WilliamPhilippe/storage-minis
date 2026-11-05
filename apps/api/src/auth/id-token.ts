import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import type { JWTPayload, JWTVerifyGetKey } from "jose";
import { IdentityRejected } from "./errors.js";
import type {
  IdTokenVerifier,
  SignInProvider,
  VerifiedIdentity,
} from "./types.js";

/**
 * Google's public keys for Firebase ID tokens as a JWK set (sign-in plan
 * SI-05). jose reads JWK sets, not the x509 certificates Firebase documents;
 * on 2026-11-04 both URLs served the same two RS256 key IDs.
 */
export const googleKeysUrl = new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
);

export const tokenLimits = {
  headerChars: 4096,
  clockToleranceSeconds: 5,
  /** AU-03: a session ends 7 days after its last Google sign-in. */
  sessionSeconds: 604_800,
  uidChars: 128,
} as const;

export interface IdTokenVerifierOptions {
  /** The Firebase project whose tokens are accepted (`aud`, `iss`). */
  projectId: string;
  /** AU-11: accept `custom` sign-ins, of `e2e-` uids only. */
  acceptCustomTokens: boolean;
  /**
   * Google's key set by default, with jose's 5 s timeout, 30 s cooldown and
   * 10-minute cache; tests pass a local key set.
   */
  keys?: JWTVerifyGetKey;
  /** Milliseconds since the epoch; tests fix it. */
  now?: () => number;
}

// `Bearer` and three base64url segments; an empty signature still reaches
// jose, which refuses its algorithm.
const bearer = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*)$/;

/** Google's keys could not be read: a 500, never the token's fault. */
class KeySetUnavailable extends Error {
  override name = "KeySetUnavailable";
}

function provider(
  payload: JWTPayload,
  uid: string,
  acceptCustomTokens: boolean,
): SignInProvider {
  const { firebase } = payload;
  const value =
    typeof firebase === "object" &&
    firebase !== null &&
    "sign_in_provider" in firebase
      ? firebase.sign_in_provider
      : undefined;
  if (value === "google.com") return value;
  // AU-11: only the test opt-in, and only test users' uids.
  if (value === "custom" && acceptCustomTokens && uid.startsWith("e2e-"))
    return value;
  throw new IdentityRejected("provider_rejected");
}

function identity(
  payload: JWTPayload,
  nowSeconds: number,
  options: IdTokenVerifierOptions,
): VerifiedIdentity {
  const { sub, iat } = payload;
  const authTime = payload.auth_time;
  const latest = nowSeconds + tokenLimits.clockToleranceSeconds;
  if (
    // Firebase's `aud` is the project ID itself; jose would also accept an
    // array containing it.
    payload.aud !== options.projectId ||
    typeof sub !== "string" ||
    sub.length === 0 ||
    sub.length > tokenLimits.uidChars ||
    // jose accepts a future `iat` unless maxTokenAge is set (prototype).
    typeof iat !== "number" ||
    iat > latest ||
    typeof authTime !== "number" ||
    !Number.isFinite(authTime) ||
    authTime > latest
  ) {
    throw new IdentityRejected("token_invalid");
  }
  const accepted = provider(payload, sub, options.acceptCustomTokens);
  if (nowSeconds - authTime > tokenLimits.sessionSeconds) {
    throw new IdentityRejected("session_limit");
  }
  return {
    uid: sub,
    email: typeof payload.email === "string" ? payload.email : null,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" ? payload.name : null,
    provider: accepted,
    authTime,
  };
}

/**
 * Verifies Firebase ID tokens with jose (T02 record AU-01, AU-03, AU-11;
 * sign-in plan SI-05). The lifecycle creates one verifier per process. The
 * token is never logged or stored; a rejection's reason travels as the
 * `IdentityRejected` code, with jose's error as its cause.
 */
export function createIdTokenVerifier(
  options: IdTokenVerifierOptions,
): IdTokenVerifier {
  const source = options.keys ?? createRemoteJWKSet(googleKeysUrl);
  // Only "no key for this token" is the token's fault (an unknown `kid`, or
  // none where several keys match). A timeout, failed fetch or invalid key
  // set is Google's or the network's, so it must not sign anyone out.
  const keys: JWTVerifyGetKey = async (header, token) => {
    try {
      return await source(header, token);
    } catch (error) {
      if (
        error instanceof errors.JWKSNoMatchingKey ||
        error instanceof errors.JWKSMultipleMatchingKeys
      ) {
        throw error;
      }
      throw new KeySetUnavailable("Google's key set is unavailable.", {
        cause: error,
      });
    }
  };
  const issuer = `https://securetoken.google.com/${options.projectId}`;
  const now = options.now ?? Date.now;

  return {
    async verify(authorization) {
      const token =
        authorization !== undefined &&
        authorization.length <= tokenLimits.headerChars
          ? bearer.exec(authorization)?.[1]
          : undefined;
      if (token === undefined) throw new IdentityRejected("token_missing");
      const current = now();
      let payload: JWTPayload;
      try {
        ({ payload } = await jwtVerify(token, keys, {
          algorithms: ["RS256"],
          issuer,
          audience: options.projectId,
          requiredClaims: ["sub", "iat", "exp", "auth_time"],
          clockTolerance: tokenLimits.clockToleranceSeconds,
          currentDate: new Date(current),
        }));
      } catch (error) {
        // Anything that is neither a key-source failure nor jose's verdict on
        // the token is a fault in this code: a 500, like the key source.
        if (!(error instanceof errors.JOSEError)) throw error;
        throw new IdentityRejected(
          error instanceof errors.JWTExpired
            ? "token_expired"
            : "token_invalid",
          { cause: error },
        );
      }
      return identity(payload, Math.floor(current / 1000), options);
    },
  };
}
