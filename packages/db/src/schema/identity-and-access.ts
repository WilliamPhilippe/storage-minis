import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import { membershipRole, organizationCurrency, userRole } from "./enums.js";

/**
 * SI-04's provisional nickname rule, until D04/E10: 3–30 lowercase ASCII
 * letters and digits in groups joined by single hyphens. Lowercase-only makes
 * uniqueness case-insensitive in effect. `organizations_nickname_format` is
 * built from these values, and the API validates its bootstrap nickname with
 * them; a change needs a forward migration.
 */
export const organizationNicknameRule = {
  minLength: 3,
  maxLength: 30,
  pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
} as const;

export const organizations = pgTable(
  "organizations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    // ORG-011: the public catalog's unique address; renamed only by a
    // global_admin (#117).
    nickname: text("nickname").notNull(),
    currency: organizationCurrency("currency").notNull().default("BRL"),
  },
  (t): PgTableExtraConfigValue[] => [
    check("organizations_positive_id", sql`${t.id} > 0`),
    unique("organizations_key_1").on(t.nickname),
    check(
      "organizations_nickname_format",
      sql`char_length(${t.nickname}) BETWEEN ${sql.raw(String(organizationNicknameRule.minLength))} AND ${sql.raw(String(organizationNicknameRule.maxLength))} AND ${t.nickname} ~ ${sql.raw(`'${organizationNicknameRule.pattern.source}'`)}`,
    ),
  ],
);

export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    firebaseUid: text("firebase_uid").notNull(),
    email: text("email"),
    displayName: text("display_name"),
    role: userRole("role").notNull().default("user"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    canEditProducts: boolean("can_edit_products").notNull().default(false),
    // AU-05: sessions whose sign-in (`auth_time`) is not later than this
    // instant, rounded up to the second, are revoked. Null: never revoked.
    sessionsValidAfter: timestamp("sessions_valid_after", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }),
  },
  (t): PgTableExtraConfigValue[] => [
    check("users_positive_id", sql`${t.id} > 0`),
    unique("users_key_1").on(t.firebaseUid),
  ],
);

export const memberships = pgTable(
  "memberships",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    userId: integer("user_id").notNull(),
    grantedAt: timestamp("granted_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    role: membershipRole("role").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("memberships_positive_id", sql`${t.id} > 0`),
    index("memberships_organization_idx").on(t.organizationId),
    unique("memberships_key_1").on(t.organizationId, t.userId),
    foreignKey({
      name: "owner_memberships",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "membership_user",
      columns: [t.userId],
      foreignColumns: [users.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);
