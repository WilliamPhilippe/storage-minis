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
import { membershipRole, userRole } from "./enums.js";

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
  },
  (t): PgTableExtraConfigValue[] => [
    check("organizations_positive_id", sql`${t.id} > 0`),
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
