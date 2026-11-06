import { SignJWT, errors, generateKeyPair } from "jose";
import type { JWTVerifyGetKey } from "jose";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  bearer,
  createTestKeys,
  customClaims,
  googleClaims,
  signToken,
  testKeyId,
  testProjectId,
} from "../../tests/tokens.js";
import type { TestKeys } from "../../tests/tokens.js";
import { IdentityRejected } from "./errors.js";
import type { IdentityRejection } from "./errors.js";
import { createIdTokenVerifier, tokenLimits } from "./id-token.js";

const nowMs = Date.UTC(2026, 10, 4, 12, 0, 0);
const now = nowMs / 1000;
let main: TestKeys;
let other: TestKeys;

beforeAll(async () => {
  [main, other] = await Promise.all([createTestKeys(), createTestKeys()]);
});

function verifier(
  options: { acceptCustomTokens?: boolean; keys?: JWTVerifyGetKey } = {},
) {
  return createIdTokenVerifier({
    projectId: testProjectId,
    acceptCustomTokens: options.acceptCustomTokens ?? false,
    keys: options.keys ?? main.keys,
    now: () => nowMs,
  });
}

async function rejection(
  promise: Promise<unknown>,
  code: IdentityRejection,
): Promise<IdentityRejected> {
  const error: unknown = await promise.then(
    () => undefined,
    (failure: unknown) => failure,
  );
  expect(error).toBeInstanceOf(IdentityRejected);
  expect((error as IdentityRejected).code).toBe(code);
  return error as IdentityRejected;
}

function google(overrides: Record<string, unknown> = {}) {
  return signToken(main.privateKey, googleClaims(now, overrides));
}

function unsigned(claims: object) {
  const part = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "none", typ: "JWT" })}.${part(claims)}.`;
}

describe("Firebase ID token verifier", () => {
  it("accepts a Google sign-in and returns only the claims the API uses", async () => {
    const identity = await verifier().verify(bearer(await google()));
    expect(identity).toEqual({
      uid: "google-uid-1",
      email: "member@example.com",
      emailVerified: true,
      name: "Member Name",
      provider: "google.com",
      authTime: now - 3600,
    });
  });

  it("accepts a custom test sign-in only under the opt-in, for e2e- uids", async () => {
    const token = await signToken(
      main.privateKey,
      customClaims(now, "e2e-owner"),
    );
    expect(
      await verifier({ acceptCustomTokens: true }).verify(bearer(token)),
    ).toEqual({
      uid: "e2e-owner",
      email: null,
      emailVerified: false,
      name: null,
      provider: "custom",
      authTime: now - 3600,
    });
    await rejection(verifier().verify(bearer(token)), "provider_rejected");
    const notTestUser = await signToken(
      main.privateKey,
      customClaims(now, "owner-uid"),
    );
    await rejection(
      verifier({ acceptCustomTokens: true }).verify(bearer(notTestUser)),
      "provider_rejected",
    );
  });

  it("treats any other header as no token, without reading a key", async () => {
    const token = await google();
    const keys = vi.fn(main.keys);
    const longest = `Bearer ${"a".repeat(tokenLimits.headerChars - 11)}.b.c`;
    expect(longest).toHaveLength(tokenLimits.headerChars);
    for (const header of [
      undefined,
      "",
      "Bearer",
      "Bearer ",
      `bearer ${token}`,
      `Basic ${token}`,
      `Bearer  ${token}`,
      `Bearer ${token} `,
      `Bearer ${token}\n`,
      `Bearer ${token}=`,
      `Bearer ${token},${token}`,
      "Bearer a.b",
      "Bearer a.b.c.d",
      "Bearer a+b.c.d",
      "Bearer .b.c",
      `${longest}d`,
    ]) {
      await rejection(verifier({ keys }).verify(header), "token_missing");
    }
    expect(keys).not.toHaveBeenCalled();
    // At the length limit the header still reaches jose, which refuses it.
    await rejection(verifier({ keys }).verify(longest), "token_invalid");
  });

  it("rejects HS256, ES256 and unsigned tokens before any key lookup", async () => {
    const keys = vi.fn(main.keys);
    const claims = googleClaims(now);
    const hs256 = await new SignJWT(claims)
      .setProtectedHeader({ alg: "HS256", kid: testKeyId })
      .sign(new TextEncoder().encode("a-shared-secret-of-thirty-two-bytes"));
    const { privateKey } = await generateKeyPair("ES256");
    const es256 = await new SignJWT(claims)
      .setProtectedHeader({ alg: "ES256", kid: testKeyId })
      .sign(privateKey);
    for (const token of [hs256, es256, unsigned(claims)]) {
      const error = await rejection(
        verifier({ keys }).verify(bearer(token)),
        "token_invalid",
      );
      expect(error.cause).toBeInstanceOf(errors.JOSEAlgNotAllowed);
    }
    expect(keys).not.toHaveBeenCalled();
  });

  it("rejects an unknown key ID, another key's signature and a tampered payload", async () => {
    const unknownKid = await signToken(main.privateKey, googleClaims(now), {
      alg: "RS256",
      kid: "unknown-key",
    });
    const otherKey = await signToken(other.privateKey, googleClaims(now));
    const [header, , signature] = (await google()).split(".");
    const [, tampered] = (await google({ sub: "someone-else" })).split(".");
    const forged = `${header}.${tampered}.${signature}`;
    const errorTypes = [];
    for (const token of [unknownKid, otherKey, forged]) {
      const error = await rejection(
        verifier().verify(bearer(token)),
        "token_invalid",
      );
      errorTypes.push(error.cause?.constructor.name);
    }
    expect(errorTypes).toEqual([
      "JWKSNoMatchingKey",
      "JWSSignatureVerificationFailed",
      "JWSSignatureVerificationFailed",
    ]);
  });

  it("accepts only the configured project as issuer and audience", async () => {
    for (const overrides of [
      { iss: "https://securetoken.google.com/storage-minis" },
      { aud: "storage-minis" },
      { iss: "https://accounts.google.com" },
    ]) {
      const token = await google(overrides);
      const error = await rejection(
        verifier().verify(bearer(token)),
        "token_invalid",
      );
      expect(error.cause).toBeInstanceOf(errors.JWTClaimValidationFailed);
    }
    // jose accepts an array containing the project; Firebase never sends one.
    for (const aud of [[testProjectId], [testProjectId, "storage-minis"]]) {
      await rejection(
        verifier().verify(bearer(await google({ aud }))),
        "token_invalid",
      );
    }
  });

  it("expires a token at exp, with a 5 s tolerance", async () => {
    await rejection(
      verifier().verify(bearer(await google({ exp: now - 5 }))),
      "token_expired",
    );
    expect(
      (await verifier().verify(bearer(await google({ exp: now - 4 })))).uid,
    ).toBe("google-uid-1");
  });

  it("rejects an iat or auth_time later than now plus 5 s", async () => {
    for (const claim of ["iat", "auth_time"]) {
      await rejection(
        verifier().verify(bearer(await google({ [claim]: now + 6 }))),
        "token_invalid",
      );
      expect(
        (await verifier().verify(bearer(await google({ [claim]: now + 5 }))))
          .uid,
      ).toBe("google-uid-1");
    }
  });

  it("requires sub, iat, exp and auth_time, with numeric times", async () => {
    for (const overrides of [
      { sub: undefined },
      { iat: undefined },
      { exp: undefined },
      { auth_time: undefined },
      { iat: String(now) },
      { exp: String(now + 60) },
      { auth_time: String(now) },
      { auth_time: null },
    ]) {
      await rejection(
        verifier().verify(bearer(await google(overrides))),
        "token_invalid",
      );
    }
  });

  it("accepts a uid of 1 to 128 characters only", async () => {
    for (const sub of ["", "u".repeat(tokenLimits.uidChars + 1), 42]) {
      await rejection(
        verifier().verify(bearer(await google({ sub }))),
        "token_invalid",
      );
    }
    for (const sub of ["u", "u".repeat(tokenLimits.uidChars)]) {
      expect((await verifier().verify(bearer(await google({ sub })))).uid).toBe(
        sub,
      );
    }
  });

  it("ends a session exactly 7 days after its last Google sign-in", async () => {
    const limit = await google({ auth_time: now - 604_800 });
    expect((await verifier().verify(bearer(limit))).authTime).toBe(
      now - 604_800,
    );
    await rejection(
      verifier().verify(bearer(await google({ auth_time: now - 604_801 }))),
      "session_limit",
    );
  });

  it("rejects every other sign-in provider, even with the opt-in", async () => {
    for (const firebase of [
      { sign_in_provider: "anonymous" },
      { sign_in_provider: "password" },
      { sign_in_provider: "phone" },
      { sign_in_provider: "github.com" },
      { sign_in_provider: "Google.com" },
      { sign_in_provider: 1 },
      {},
      "google.com",
      undefined,
    ]) {
      await rejection(
        verifier({ acceptCustomTokens: true }).verify(
          bearer(await google({ firebase })),
        ),
        "provider_rejected",
      );
    }
  });

  it("answers a key-source failure with an error that is not a 401", async () => {
    const token = bearer(await google());
    for (const failure of [
      new errors.JWKSTimeout(),
      new TypeError("fetch failed"),
      new errors.JWKSInvalid("JSON Web Key Set malformed"),
      new errors.JOSEError(
        "Expected 200 OK from the JSON Web Key Set HTTP response",
      ),
    ]) {
      const error: unknown = await verifier({
        keys: () => Promise.reject(failure),
      })
        .verify(token)
        .then(
          () => undefined,
          (rejected: unknown) => rejected,
        );
      expect(error).not.toBeInstanceOf(IdentityRejected);
      expect(error).toMatchObject({
        name: "KeySetUnavailable",
        cause: failure,
      });
    }
    // An unknown key ID is the token's fault, even through the key source.
    await rejection(
      verifier({
        keys: () => Promise.reject(new errors.JWKSNoMatchingKey()),
      }).verify(token),
      "token_invalid",
    );
  });
});
