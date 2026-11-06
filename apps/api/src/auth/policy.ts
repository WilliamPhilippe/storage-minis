/**
 * T02's decision rules as pure functions (T02 record AU-01, AU-05, AU-07,
 * AU-08, AU-09). The guarded builders, `session.get` and the identity store
 * share them; nothing here reads a database, a header or the clock.
 */
import type {
  BootstrapSettings,
  MembershipRole,
  Profile,
  StoredUser,
  VerifiedIdentity,
} from "./types.js";

/**
 * AU-05: a session is revoked when its sign-in (`auth_time`, whole seconds)
 * is not later than `sessions_valid_after` rounded up to the second. Stricter
 * than Firebase's `checkRevoked`: no session from the cutoff's own second
 * survives, at the cost of refusing once a sign-in made in that second.
 */
export function isRevoked(
  identity: Pick<VerifiedIdentity, "authTime">,
  user: Pick<StoredUser, "sessionsValidAfter">,
): boolean {
  const cutoff = user.sessionsValidAfter;
  return (
    cutoff !== null && identity.authTime <= Math.ceil(cutoff.getTime() / 1000)
  );
}

/** AU-01: the profile copied from a Google token; the email lowercased. */
export function profileOf(identity: VerifiedIdentity): Profile {
  return {
    email: identity.email?.trim().toLowerCase() ?? null,
    displayName: identity.name,
  };
}

/**
 * AU-07's trigger, before the store checks that no Organization exists: a
 * verified Google email equal to the configured owner's, ignoring case and
 * surrounding whitespace. Custom tokens and unverified emails never qualify.
 */
export function bootstrapApplies(
  identity: VerifiedIdentity,
  settings: BootstrapSettings,
): boolean {
  return (
    identity.provider === "google.com" &&
    identity.emailVerified &&
    profileOf(identity).email === settings.ownerEmail
  );
}

const maxId = 2_147_483_647;

/**
 * AU-09: `x-organization-id` is a positive int32 in plain decimal; anything
 * else (signs, leading zeros, spaces, several values) is undefined.
 */
export function parseOrganizationId(
  header: string | undefined,
): number | undefined {
  if (header === undefined || !/^[1-9][0-9]{0,9}$/.test(header))
    return undefined;
  const id = Number(header);
  return id <= maxId ? id : undefined;
}

const rank: Record<MembershipRole, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

/** AU-08: Membership roles are ordered viewer < editor < owner. */
export function hasRole(
  role: MembershipRole,
  minimum: MembershipRole,
): boolean {
  return rank[role] >= rank[minimum];
}
