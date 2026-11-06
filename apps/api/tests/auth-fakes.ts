// Test support: fake sign-in services for unit tests (sign-in plan SI-16).
// It imports only types from the API and the DB package, so tests that mock
// `@storage-minis/db` to throw can use it.
import { vi } from "vitest";
import type { Mock } from "vitest";
import type {
  AuthDependencies,
  IdentityStore,
  OrganizationAccess,
  StoredUser,
  VerifiedIdentity,
} from "../src/auth/types.js";

export type FakeStore = { [K in keyof IdentityStore]: Mock<IdentityStore[K]> };

function unexpected(name: string) {
  return () =>
    Promise.reject(new Error(`Unexpected identity store call: ${name}.`));
}

/** Every method fails until a test gives it a result. */
export function fakeStore(): FakeStore {
  return {
    findUser: vi.fn<IdentityStore["findUser"]>(unexpected("findUser")),
    listMemberships: vi.fn<IdentityStore["listMemberships"]>(
      unexpected("listMemberships"),
    ),
    findMembership: vi.fn<IdentityStore["findMembership"]>(
      unexpected("findMembership"),
    ),
    refreshProfile: vi.fn<IdentityStore["refreshProfile"]>(
      unexpected("refreshProfile"),
    ),
    bootstrap: vi.fn<IdentityStore["bootstrap"]>(unexpected("bootstrap")),
  };
}

/** Sign-in services that fail if a test reaches them. */
export function unusedAuth(): AuthDependencies {
  return {
    verifier: {
      verify: vi.fn(() =>
        Promise.reject(new Error("Unexpected token verification.")),
      ),
    },
    store: fakeStore(),
    bootstrap: null,
  };
}

/** A verified Google identity; tests override fields. */
export function googleIdentity(
  overrides: Partial<VerifiedIdentity> = {},
): VerifiedIdentity {
  return {
    uid: "google-uid-1",
    email: "member@example.com",
    emailVerified: true,
    name: "Member Name",
    provider: "google.com",
    authTime: 1_793_800_000,
    ...overrides,
  };
}

export function storedUser(overrides: Partial<StoredUser> = {}): StoredUser {
  return {
    id: 7,
    email: "member@example.com",
    displayName: "Member Name",
    role: "user",
    canEditProducts: false,
    sessionsValidAfter: null,
    ...overrides,
  };
}

export function access(
  role: OrganizationAccess["role"],
  id = 11,
): OrganizationAccess {
  return {
    role,
    organization: {
      id,
      name: `Garage ${id}`,
      nickname: `garage-${id}`,
      currency: "BRL",
    },
  };
}
