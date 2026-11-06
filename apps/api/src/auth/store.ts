import { and, asc, eq, schema, sql } from "@storage-minis/db";
import type { Database } from "@storage-minis/db";
import { profileOf } from "./policy.js";
import type { IdentityStore, StoredUser } from "./types.js";

const {
  users,
  organizations,
  memberships,
  businessEvents,
  businessEventChanges,
} = schema;

/**
 * The bootstrap's transaction-scoped advisory lock (sign-in plan SI-08): a
 * fixed 64-bit key, the ASCII bytes of "SMBOOT01".
 */
export const bootstrapLockKey = 0x534d424f4f543031n;

const userColumns = {
  id: users.id,
  email: users.email,
  displayName: users.displayName,
  role: users.role,
  canEditProducts: users.canEditProducts,
  sessionsValidAfter: users.sessionsValidAfter,
};

const accessColumns = {
  role: memberships.role,
  organization: {
    id: organizations.id,
    name: organizations.name,
    nickname: organizations.nickname,
    currency: organizations.currency,
  },
};

function one<T>(rows: T[]): T {
  const [row] = rows;
  if (row === undefined) throw new Error("Expected one returned row.");
  return row;
}

/**
 * The identity queries as Drizzle queries on the schema (SI-06). With the
 * lifecycle, this is the only API module that imports `@storage-minis/db` at
 * runtime; the tRPC modules receive it through the context.
 */
export function createIdentityStore(db: Database["db"]): IdentityStore {
  return {
    async findUser(uid) {
      const [user] = await db
        .select(userColumns)
        .from(users)
        .where(eq(users.firebaseUid, uid));
      return user;
    },

    async listMemberships(userId) {
      return await db
        .select(accessColumns)
        .from(memberships)
        .innerJoin(
          organizations,
          eq(organizations.id, memberships.organizationId),
        )
        .where(eq(memberships.userId, userId))
        .orderBy(asc(memberships.organizationId));
    },

    async findMembership(userId, organizationId) {
      const [access] = await db
        .select(accessColumns)
        .from(memberships)
        .innerJoin(
          organizations,
          eq(organizations.id, memberships.organizationId),
        )
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            eq(memberships.userId, userId),
          ),
        );
      return access;
    },

    async refreshProfile(userId, profile) {
      return one(
        await db
          .update(users)
          .set(profile)
          .where(eq(users.id, userId))
          .returning(userColumns),
      );
    },

    /**
     * AU-07 and SI-08 in one transaction. Concurrent first sign-ins serialize
     * on the lock: one creates the rows, the others then find its User. A
     * failure (a unique violation from a hand-made row, say) rolls everything
     * back and answers 500.
     */
    async bootstrap(identity, settings) {
      return await db.transaction(
        async (tx): Promise<StoredUser | undefined> => {
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(${sql.raw(bootstrapLockKey.toString())})`,
          );
          const [existing] = await tx
            .select(userColumns)
            .from(users)
            .where(eq(users.firebaseUid, identity.uid));
          if (existing !== undefined) return existing;
          const [anyOrganization] = await tx
            .select({ id: organizations.id })
            .from(organizations)
            .limit(1);
          if (anyOrganization !== undefined) return undefined;

          const user = one(
            await tx
              .insert(users)
              .values({
                firebaseUid: identity.uid,
                ...profileOf(identity),
                role: "global_admin",
                canEditProducts: true,
              })
              .returning(userColumns),
          );
          const organization = one(
            await tx
              .insert(organizations)
              .values(settings.organization)
              .returning({ id: organizations.id }),
          );
          await tx.insert(memberships).values({
            organizationId: organization.id,
            userId: user.id,
            role: "owner",
            grantedAt: sql`now()`,
          });
          // The schema has no Organization subject for a change row, so the
          // event records the Organization's creation and its one change the
          // owner Membership's grant (AU-07).
          const event = one(
            await tx
              .insert(businessEvents)
              .values({
                scope: "organization",
                organizationId: organization.id,
                actorUserId: user.id,
                actionType: "organization.bootstrap",
                occurredAt: sql`now()`,
              })
              .returning({ id: businessEvents.id }),
          );
          await tx.insert(businessEventChanges).values({
            businessEventId: event.id,
            organizationId: organization.id,
            sequence: 1,
            changeKind: "membership.grant",
            membershipUserId: user.id,
            afterFacts: { role: "owner" },
          });
          return user;
        },
      );
    },
  };
}
