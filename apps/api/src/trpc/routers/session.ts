import { z } from "zod";
import { bootstrapApplies, profileOf } from "../../auth/policy.js";
import type { OrganizationAccess, StoredUser } from "../../auth/types.js";
import { t } from "../init.js";
import { identityProcedure, rejectRevoked } from "../procedures.js";

const member = z.strictObject({
  status: z.literal("member"),
  user: z.strictObject({
    id: z.number().int().positive(),
    displayName: z.string().nullable(),
    email: z.string().nullable(),
    role: z.enum(["global_admin", "editor", "user"]),
    canEditProducts: z.boolean(),
  }),
  memberships: z
    .array(
      z.strictObject({
        role: z.enum(["owner", "editor", "viewer"]),
        organization: z.strictObject({
          id: z.number().int().positive(),
          name: z.string(),
          nickname: z.string(),
          currency: z.enum(["BRL", "USD"]),
        }),
      }),
    )
    .min(1),
});

const sessionOutput = z.discriminatedUnion("status", [
  member,
  z.strictObject({ status: z.literal("noAccess") }),
]);

type Session = z.infer<typeof sessionOutput>;

function session(user: StoredUser, access: OrganizationAccess[]): Session {
  // AU-10: no Membership means no access, a global_admin included.
  if (access.length === 0) return { status: "noAccess" };
  return {
    status: "member",
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      canEditProducts: user.canEditProducts,
    },
    memberships: access.map(({ role, organization }) => ({
      role,
      organization: {
        id: organization.id,
        name: organization.name,
        nickname: organization.nickname,
        currency: organization.currency,
      },
    })),
  };
}

export const sessionRouter = t.router({
  /**
   * The caller's session (sign-in plan SI-07): the User and its Memberships,
   * or `noAccess` without any profile data. It answers Google accounts with
   * no User row, so it needs only a valid token.
   *
   * A query that may write: the one-time bootstrap (AU-07) and the profile
   * copy when Google's email or name changed (AU-01). Both are idempotent and
   * roll back on failure, so a client's retry is harmless.
   */
  get: identityProcedure.output(sessionOutput).query(async ({ ctx }) => {
    const { identity, auth } = ctx;
    let user = await auth.store.findUser(identity.uid);
    if (user !== undefined) {
      rejectRevoked(identity, user);
      // Custom test tokens carry no email or name and change nothing.
      if (identity.provider === "google.com") {
        const profile = profileOf(identity);
        if (
          profile.email !== user.email ||
          profile.displayName !== user.displayName
        ) {
          user = await auth.store.refreshProfile(user.id, profile);
        }
      }
    } else if (
      auth.bootstrap !== null &&
      bootstrapApplies(identity, auth.bootstrap)
    ) {
      user = await auth.store.bootstrap(identity, auth.bootstrap);
    }
    // AU-10: nothing is stored about an account without a User row.
    if (user === undefined) return { status: "noAccess" };
    return session(user, await auth.store.listMemberships(user.id));
  }),
});
