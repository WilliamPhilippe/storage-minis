// Test support: Firebase-shaped ID tokens signed with a local RS256 key, for
// the verifier's unit tests and the auth integration suite (sign-in plan
// SI-16). Vitest stays offline: no test fetches Google's keys.
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import type { CryptoKey, JWTHeaderParameters, JWTPayload } from "jose";

export const testProjectId = "storage-minis-dev";
export const testKeyId = "test-signing-key";

export interface TestKeys {
  privateKey: CryptoKey;
  /** The public half as a local JWK set, in place of Google's. */
  keys: ReturnType<typeof createLocalJWKSet>;
}

export async function createTestKeys(kid = testKeyId): Promise<TestKeys> {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = {
    ...(await exportJWK(publicKey)),
    kid,
    alg: "RS256",
    use: "sig",
  };
  return { privateKey, keys: createLocalJWKSet({ keys: [jwk] }) };
}

/**
 * Claims of a Google sign-in's ID token, as Firebase issues them, at
 * `nowSeconds`; overrides set to `undefined` drop a claim.
 */
export function googleClaims(
  nowSeconds: number,
  overrides: Record<string, unknown> = {},
): JWTPayload {
  const uid =
    typeof overrides.sub === "string" ? overrides.sub : "google-uid-1";
  const email =
    typeof overrides.email === "string"
      ? overrides.email
      : "member@example.com";
  return {
    iss: `https://securetoken.google.com/${testProjectId}`,
    aud: testProjectId,
    sub: uid,
    user_id: uid,
    iat: nowSeconds - 60,
    exp: nowSeconds + 3540,
    auth_time: nowSeconds - 3600,
    email,
    email_verified: true,
    name: "Member Name",
    picture: "https://lh3.googleusercontent.com/a/test",
    firebase: {
      sign_in_provider: "google.com",
      identities: { "google.com": ["104"], email: [email] },
    },
    ...overrides,
  };
}

/** A custom-token sign-in's ID token: no email or name (AU-11). */
export function customClaims(
  nowSeconds: number,
  uid: string,
  overrides: Record<string, unknown> = {},
): JWTPayload {
  return {
    iss: `https://securetoken.google.com/${testProjectId}`,
    aud: testProjectId,
    sub: uid,
    user_id: uid,
    iat: nowSeconds - 60,
    exp: nowSeconds + 3540,
    auth_time: nowSeconds - 3600,
    firebase: { sign_in_provider: "custom", identities: {} },
    ...overrides,
  };
}

export function signToken(
  privateKey: CryptoKey,
  claims: JWTPayload,
  header: JWTHeaderParameters = { alg: "RS256", kid: testKeyId, typ: "JWT" },
): Promise<string> {
  return new SignJWT(claims).setProtectedHeader(header).sign(privateKey);
}

export function bearer(token: string): string {
  return `Bearer ${token}`;
}
