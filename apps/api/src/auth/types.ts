/**
 * Shapes shared by the API's sign-in modules (T02 record AU-01–AU-11, sign-in
 * plan SI-03–SI-08). Types only: the tRPC context refers to them, so this
 * module must never import runtime code or server libraries, such as jose,
 * into the browser's `@storage-minis/api/types` contract.
 */
import type { schema } from "@storage-minis/db";

export type OrganizationCurrency =
  (typeof schema.organizationCurrency.enumValues)[number];
export type MembershipRole = (typeof schema.membershipRole.enumValues)[number];

/**
 * AU-07: the configured owner's first verified Google sign-in, while no
 * Organization exists, creates the administrator and this Organization.
 */
export interface BootstrapSettings {
  /** Trimmed and lowercased; compared with the token's email the same way. */
  ownerEmail: string;
  organization: {
    name: string;
    nickname: string;
    currency: OrganizationCurrency;
  };
}

/** AU-01: `google.com`, plus `custom` under the test opt-in (AU-11). */
export type SignInProvider = "google.com" | "custom";

/** What a verified Firebase ID token tells the API (SI-05). */
export interface VerifiedIdentity {
  /** `sub`: the Firebase uid, 1–128 characters; the only lookup key. */
  uid: string;
  /** Profile data, never an authorization key after the bootstrap. */
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  provider: SignInProvider;
  /** `auth_time`: the last Google sign-in, in seconds since the epoch. */
  authTime: number;
}

export interface IdTokenVerifier {
  /**
   * Verifies the raw `authorization` header. Throws `IdentityRejected` for a
   * token the API refuses (401) and any other error when Google's keys cannot
   * be read (500), so an outage does not sign anyone out.
   */
  verify: (authorization: string | undefined) => Promise<VerifiedIdentity>;
}

export type StoredUser = Pick<
  typeof schema.users.$inferSelect,
  | "id"
  | "email"
  | "displayName"
  | "role"
  | "canEditProducts"
  | "sessionsValidAfter"
>;

export type Profile = Pick<StoredUser, "email" | "displayName">;

export interface OrganizationAccess {
  role: MembershipRole;
  organization: Pick<
    typeof schema.organizations.$inferSelect,
    "id" | "name" | "nickname" | "currency"
  >;
}

/**
 * The identity queries (SI-06). The lifecycle builds the Drizzle
 * implementation (auth/store.ts), so tRPC modules import only types from
 * `@storage-minis/db`; unit tests inject fakes.
 */
export interface IdentityStore {
  /** One indexed read by `users_key_1`. */
  findUser: (uid: string) => Promise<StoredUser | undefined>;
  /** The User's Memberships with their Organizations, by Organization ID. */
  listMemberships: (userId: number) => Promise<OrganizationAccess[]>;
  /** One indexed read by `memberships_key_1`, joined with the Organization. */
  findMembership: (
    userId: number,
    organizationId: number,
  ) => Promise<OrganizationAccess | undefined>;
  /** AU-01: copies Google's current email and name into the User row. */
  refreshProfile: (userId: number, profile: Profile) => Promise<StoredUser>;
  /**
   * AU-07, in one transaction under an advisory lock: the User with this uid
   * if one exists by then, undefined if any Organization exists, otherwise
   * the newly created administrator.
   */
  bootstrap: (
    identity: VerifiedIdentity,
    settings: BootstrapSettings,
  ) => Promise<StoredUser | undefined>;
}

/** What `buildApp` receives for sign-in; the lifecycle builds it (SI-06). */
export interface AuthDependencies {
  verifier: IdTokenVerifier;
  store: IdentityStore;
  bootstrap: BootstrapSettings | null;
}
