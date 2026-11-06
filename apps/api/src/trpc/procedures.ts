import { TRPCError } from "@trpc/server";
import { AccessDenied, IdentityRejected } from "../auth/errors.js";
import type { AccessRejection } from "../auth/errors.js";
import { hasRole, isRevoked, parseOrganizationId } from "../auth/policy.js";
import type {
  MembershipRole,
  StoredUser,
  VerifiedIdentity,
} from "../auth/types.js";
import { recordProcedure } from "./context.js";
import { t } from "./init.js";
import type { AuthContext } from "./init.js";

/**
 * The guarded procedure classes (T02 record AU-09, sign-in plan SI-06). Every
 * business procedure starts from one of these; public routers keep deriving
 * module-private builders, as `diagnostics` does (P5-06). Each rejection's
 * reason is the cause's `code` in the `request_failed` log line.
 */

function denied(
  code: "BAD_REQUEST" | "FORBIDDEN",
  reason: AccessRejection,
): TRPCError {
  return new TRPCError({ code, cause: new AccessDenied(reason) });
}

async function verify(auth: AuthContext): Promise<VerifiedIdentity> {
  try {
    return await auth.verifier.verify(auth.authorization);
  } catch (error) {
    // A key-source failure is a 500, so a Google outage signs nobody out.
    throw new TRPCError({
      code:
        error instanceof IdentityRejected
          ? "UNAUTHORIZED"
          : "INTERNAL_SERVER_ERROR",
      cause: error,
    });
  }
}

/** AU-05: refuses a session that `sessions_valid_after` revoked (401). */
export function rejectRevoked(
  identity: VerifiedIdentity,
  user: StoredUser,
): void {
  if (isRevoked(identity, user)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      cause: new IdentityRejected("session_revoked"),
    });
  }
}

/** A valid token; adds `ctx.identity`. Never treats a missing token as public. */
export const identityProcedure = t.procedure
  .use(recordProcedure)
  .use(async ({ ctx, next }) =>
    next({ ctx: { identity: await verify(ctx.auth) } }),
  );

/**
 * Plus a User row for the token's uid (403 without one) and a session that
 * is not revoked (401); adds `ctx.user`.
 */
export const userProcedure = identityProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.auth.store.findUser(ctx.identity.uid);
  if (user === undefined) throw denied("FORBIDDEN", "user_missing");
  rejectRevoked(ctx.identity, user);
  return next({
    ctx: {
      user: {
        id: user.id,
        role: user.role,
        canEditProducts: user.canEditProducts,
      },
    },
  });
});

/**
 * Plus `x-organization-id` (a positive int32, else 400) naming an
 * Organization where the User holds at least `minimum` (403 otherwise,
 * identical whether that Organization exists or not). Adds
 * `ctx.organization` and `ctx.membership`. Queries filter by
 * `ctx.organization.id`, so another Organization's records look nonexistent.
 */
export function organizationProcedure(minimum: MembershipRole) {
  return userProcedure.use(async ({ ctx, next }) => {
    const organizationId = parseOrganizationId(ctx.auth.organizationHeader);
    if (organizationId === undefined)
      throw denied("BAD_REQUEST", "organization_header_invalid");
    const access = await ctx.auth.store.findMembership(
      ctx.user.id,
      organizationId,
    );
    if (access === undefined) throw denied("FORBIDDEN", "membership_missing");
    if (!hasRole(access.role, minimum))
      throw denied("FORBIDDEN", "role_too_low");
    return next({
      ctx: {
        organization: {
          id: access.organization.id,
          currency: access.organization.currency,
        },
        membership: { role: access.role },
      },
    });
  });
}

/**
 * Platform actions: a `global_admin`, with no implicit access to any
 * Organization's records (AU-08).
 */
export const platformProcedure = userProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "global_admin")
    throw denied("FORBIDDEN", "global_admin_required");
  return next();
});

/** AU-08: `can_edit_products` alone authorizes editing an existing Product. */
export function requireCanEditProducts(user: {
  canEditProducts: boolean;
}): void {
  if (!user.canEditProducts) throw denied("FORBIDDEN", "product_edit_required");
}
