import {
  createDatabase,
  readDatabaseConfig,
  requireTestDatabase,
} from "@storage-minis/db";
import type { Database } from "@storage-minis/db";
import { TRPCError } from "@trpc/server";
import type { FastifyInstance, LightMyRequestResponse } from "fastify";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { z } from "zod";
import { buildApp } from "../src/app.js";
import { createIdTokenVerifier } from "../src/auth/id-token.js";
import { createIdentityStore } from "../src/auth/store.js";
import type { AuthDependencies, BootstrapSettings } from "../src/auth/types.js";
import type { ApiConfig } from "../src/config.js";
import { t } from "../src/trpc/init.js";
import type { Context } from "../src/trpc/init.js";
import { trpcRoutes } from "../src/trpc/plugin.js";
import {
  organizationProcedure,
  platformProcedure,
  requireCanEditProducts,
  userProcedure,
} from "../src/trpc/procedures.js";
import {
  bearer,
  createTestKeys,
  customClaims,
  googleClaims,
  signToken,
  testProjectId,
} from "./tokens.js";
import type { TestKeys } from "./tokens.js";

// The api-process global setup migrated this database after refusing any not
// named *_test; repeat the guard for direct imports. Fixtures and the API run
// as the app role; operator SQL and cleanup run as the owner, as
// local-development.md documents them.
const appConfig = readDatabaseConfig(process.env);
const ownerConfig = readDatabaseConfig(process.env, "MIGRATION_DATABASE_URL");
requireTestDatabase(appConfig);
requireTestDatabase(ownerConfig);

const httpConfig: ApiConfig["http"] = {
  host: "127.0.0.1",
  port: 3000,
  logLevel: "info",
  nodeEnv: "test",
};
const settings: BootstrapSettings = {
  ownerEmail: "owner@example.com",
  organization: {
    name: "Bootstrap Garage",
    nickname: "bootstrap-garage",
    currency: "BRL",
  },
};

let database: Database;
let owner: Database;
let keys: TestKeys;
let output: string[];
const apps: FastifyInstance[] = [];
// Every token and email a test sends; none may reach a log line.
const sentTokens = new Set<string>();
const sentEmails = new Set<string>();

// AU-12 cases 17 and 25: an Organization's record, looked up only within
// ctx.organization.id. Business events stand in for the records (units,
// Sales) whose procedures do not exist yet.
const recordInput = z.strictObject({
  id: z.number().int().positive().max(2_147_483_647),
});

async function record(
  ctx: Context & { organization: { id: number } },
  id: number,
) {
  const found = await ctx.db.query.businessEvents.findFirst({
    columns: { id: true },
    where: (event, { and, eq }) =>
      and(eq(event.id, id), eq(event.organizationId, ctx.organization.id)),
  });
  if (found === undefined) throw new TRPCError({ code: "NOT_FOUND" });
  return found;
}

// Test-only probes, one per builder and role (SI-16); never in appRouter.
const probeRouter = t.router({
  user: userProcedure.query(({ ctx }) => ({ id: ctx.user.id })),
  viewer: organizationProcedure("viewer").query(({ ctx }) => ({
    organization: ctx.organization.id,
    role: ctx.membership.role,
  })),
  editor: organizationProcedure("editor").mutation(({ ctx }) => ({
    role: ctx.membership.role,
  })),
  owner: organizationProcedure("owner").mutation(({ ctx }) => ({
    role: ctx.membership.role,
  })),
  platform: platformProcedure.query(() => ({ ok: true })),
  record: organizationProcedure("viewer")
    .input(recordInput)
    .query(({ ctx, input }) => record(ctx, input.id)),
  // Unit photos: the Organization class alone, no can_edit_products (AU-08).
  editRecord: organizationProcedure("editor")
    .input(recordInput)
    .mutation(({ ctx, input }) => record(ctx, input.id)),
  registerProduct: organizationProcedure("editor").mutation(() => ({
    ok: true,
  })),
  editProduct: userProcedure.mutation(({ ctx }) => {
    requireCanEditProducts(ctx.user);
    return { ok: true };
  }),
});

function createApp(
  options: {
    acceptCustomTokens?: boolean;
    bootstrap?: BootstrapSettings | null;
  } = {},
) {
  const auth: AuthDependencies = {
    verifier: createIdTokenVerifier({
      projectId: testProjectId,
      acceptCustomTokens: options.acceptCustomTokens ?? false,
      keys: keys.keys,
    }),
    store: createIdentityStore(database.db),
    bootstrap: options.bootstrap === undefined ? settings : options.bootstrap,
  };
  const app = buildApp(httpConfig, {
    database,
    isClosing: () => false,
    auth,
  });
  void app.register(trpcRoutes, {
    prefix: "/trpc-probe",
    router: probeRouter,
    db: database.db,
    auth,
  });
  apps.push(app);
  return app;
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

async function google(
  uid: string,
  email: string,
  overrides: Record<string, unknown> = {},
) {
  sentEmails.add(email.toLowerCase());
  const token = bearer(
    await signToken(
      keys.privateKey,
      googleClaims(nowSeconds(), { sub: uid, email, ...overrides }),
    ),
  );
  sentTokens.add(token);
  return token;
}

async function custom(uid: string) {
  const token = bearer(
    await signToken(keys.privateKey, customClaims(nowSeconds(), uid)),
  );
  sentTokens.add(token);
  return token;
}

function session(app: FastifyInstance, authorization: string) {
  return app.inject({ url: "/trpc/session.get", headers: { authorization } });
}

function probe(
  app: FastifyInstance,
  path: string,
  authorization: string,
  options: { organization?: number; input?: unknown; mutation?: boolean } = {},
) {
  const headers: Record<string, string> = { authorization };
  if (options.organization !== undefined)
    headers["x-organization-id"] = String(options.organization);
  if (options.mutation) {
    headers["content-type"] = "application/json";
    return app.inject({
      method: "POST",
      url: `/trpc-probe/${path}`,
      headers,
      ...(options.input === undefined
        ? {}
        : { payload: JSON.stringify(options.input) }),
    });
  }
  const search =
    options.input === undefined
      ? ""
      : `?input=${encodeURIComponent(JSON.stringify(options.input))}`;
  return app.inject({ url: `/trpc-probe/${path}${search}`, headers });
}

function data(response: LightMyRequestResponse): unknown {
  expect(response.statusCode).toBe(200);
  return response.json<{ result: { data: unknown } }>().result.data;
}

function rejected(response: LightMyRequestResponse, status: number) {
  expect(response.statusCode).toBe(status);
  return response.body;
}

const noAccess = { status: "noAccess" };

// SQL fixtures as the app role; they are not business writers.
async function insert(sql: string, values: unknown[]): Promise<number> {
  const result = await database.db.$client.query<{ id: number }>(
    `${sql} RETURNING id`,
    values,
  );
  const id = result.rows[0]?.id;
  if (id === undefined) throw new Error("Fixture insert returned no identity.");
  return id;
}

function organization(nickname: string) {
  return insert("INSERT INTO organizations (name, nickname) VALUES ($1, $1)", [
    nickname,
  ]);
}

function user(
  uid: string,
  options: { role?: string; canEditProducts?: boolean; email?: string } = {},
) {
  return insert(
    "INSERT INTO users (firebase_uid, email, display_name, role, can_edit_products) VALUES ($1, $2, 'Member Name', $3, $4)",
    [
      uid,
      options.email ?? null,
      options.role ?? "user",
      options.canEditProducts ?? false,
    ],
  );
}

function membership(organizationId: number, userId: number, role: string) {
  return insert(
    "INSERT INTO memberships (organization_id, user_id, granted_at, role) VALUES ($1, $2, now(), $3)",
    [organizationId, userId, role],
  );
}

function event(organizationId: number, actorUserId: number) {
  return insert(
    "INSERT INTO business_events (scope, organization_id, actor_user_id, action_type, occurred_at) VALUES ('organization', $1, $2, 'test.fixture', now())",
    [organizationId, actorUserId],
  );
}

async function counts() {
  const result = await database.db.$client.query<Record<string, number>>(
    "SELECT (SELECT count(*)::integer FROM users) AS users, (SELECT count(*)::integer FROM organizations) AS organizations, (SELECT count(*)::integer FROM memberships) AS memberships, (SELECT count(*)::integer FROM business_events) AS events, (SELECT count(*)::integer FROM business_event_changes) AS changes",
  );
  return result.rows[0];
}

beforeAll(async () => {
  database = createDatabase(appConfig);
  owner = createDatabase(ownerConfig);
  await Promise.all([database.check(), owner.check()]);
  keys = await createTestKeys();
});

afterAll(async () => {
  await Promise.all([database.close(), owner.close()]);
});

beforeEach(async () => {
  // The app role has no TRUNCATE; the owner clears the identity tables and
  // everything that references them.
  await owner.db.$client.query(
    "TRUNCATE users, organizations, memberships, business_events, business_event_changes RESTART IDENTITY CASCADE",
  );
  output = [];
  vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    output.push(String(chunk));
    return true;
  });
});

afterEach(async () => {
  try {
    // The log policy (SI-06): no token, email or header value in any line.
    const logs = output.join("");
    for (const token of sentTokens) {
      // The whole value, and its payload and signature on their own.
      for (const part of [token, ...token.split(".").slice(1)])
        expect(logs).not.toContain(part);
    }
    for (const email of sentEmails)
      expect(logs.toLowerCase()).not.toContain(email);
    expect(logs).not.toMatch(/Bearer|x-organization-id|@example\.com/i);
    for (const app of apps) await app.close();
  } finally {
    apps.length = 0;
    vi.restoreAllMocks();
  }
});

describe("bootstrap (AU-07)", () => {
  it("1: creates the administrator, the first Organization, its owner Membership and the audit rows", async () => {
    const app = createApp();
    const response = await session(
      app,
      await google("owner-uid", "Owner@Example.com", { name: "Owner Name" }),
    );
    expect(data(response)).toEqual({
      status: "member",
      user: {
        id: 1,
        displayName: "Owner Name",
        email: "owner@example.com",
        role: "global_admin",
        canEditProducts: true,
      },
      memberships: [
        {
          role: "owner",
          organization: {
            id: 1,
            name: "Bootstrap Garage",
            nickname: "bootstrap-garage",
            currency: "BRL",
          },
        },
      ],
    });
    const { rows } = await database.db.$client.query<Record<string, unknown>>(
      "SELECT e.scope, e.organization_id, e.actor_user_id, e.action_type, e.occurred_at = e.recorded_at AS same_time, e.context_organization_id, c.organization_id AS change_organization_id, c.sequence, c.change_kind, c.membership_user_id, c.before_facts, c.after_facts, m.granted_at = e.occurred_at AS granted_then, u.firebase_uid FROM business_events e JOIN business_event_changes c ON c.business_event_id = e.id JOIN memberships m ON m.organization_id = e.organization_id JOIN users u ON u.id = e.actor_user_id",
    );
    expect(rows).toEqual([
      {
        scope: "organization",
        organization_id: 1,
        actor_user_id: 1,
        action_type: "organization.bootstrap",
        same_time: true,
        context_organization_id: null,
        change_organization_id: 1,
        sequence: 1,
        change_kind: "membership.grant",
        membership_user_id: 1,
        before_facts: null,
        after_facts: { role: "owner" },
        granted_then: true,
        firebase_uid: "owner-uid",
      },
    ]);
    expect(await counts()).toEqual({
      users: 1,
      organizations: 1,
      memberships: 1,
      events: 1,
      changes: 1,
    });
  });

  it("2: signing in again creates no rows", async () => {
    const app = createApp();
    const first = data(
      await session(app, await google("owner-uid", "owner@example.com")),
    );
    const again = data(
      await session(app, await google("owner-uid", "owner@example.com")),
    );
    expect(again).toEqual(first);
    expect(await counts()).toEqual({
      users: 1,
      organizations: 1,
      memberships: 1,
      events: 1,
      changes: 1,
    });
  });

  it("3: concurrent first requests bootstrap once and answer the same session", async () => {
    const app = createApp();
    const token = await google("owner-uid", "owner@example.com");
    const responses = await Promise.all(
      Array.from({ length: 5 }, () => session(app, token)),
    );
    const bodies = responses.map((response) => data(response));
    for (const body of bodies) expect(body).toEqual(bodies[0]);
    expect(bodies[0]).toMatchObject({ status: "member" });
    expect(await counts()).toEqual({
      users: 1,
      organizations: 1,
      memberships: 1,
      events: 1,
      changes: 1,
    });
  });

  it("4: another Google account first gets noAccess and leaves no row", async () => {
    const app = createApp();
    expect(
      data(
        await session(
          app,
          await google("stranger-uid", "stranger@example.com"),
        ),
      ),
    ).toEqual(noAccess);
    expect((await counts())?.users).toBe(0);
  });

  it("5: once an Organization exists, the owner's email under a new uid gets noAccess", async () => {
    const app = createApp();
    await session(app, await google("owner-uid", "owner@example.com"));
    expect(
      data(
        await session(app, await google("new-owner-uid", "owner@example.com")),
      ),
    ).toEqual(noAccess);
    expect((await counts())?.users).toBe(1);
  });

  it("6: a custom token or an unverified email claiming the owner's address never bootstraps", async () => {
    const app = createApp({ acceptCustomTokens: true });
    const customToken = bearer(
      await signToken(
        keys.privateKey,
        customClaims(nowSeconds(), "e2e-owner", {
          email: "owner@example.com",
          email_verified: true,
        }),
      ),
    );
    sentTokens.add(customToken);
    for (const token of [
      customToken,
      await google("owner-uid", "owner@example.com", { email_verified: false }),
    ]) {
      expect(data(await session(app, token))).toEqual(noAccess);
    }
    expect(await counts()).toEqual({
      users: 0,
      organizations: 0,
      memberships: 0,
      events: 0,
      changes: 0,
    });
  });
});

describe("sessions and revocation (AU-03, AU-05, AU-06)", () => {
  it("11: refuses a token more than 7 days after its sign-in", async () => {
    const app = createApp();
    const stale = await google("owner-uid", "owner@example.com", {
      auth_time: nowSeconds() - 604_801,
    });
    expect(rejected(await session(app, stale), 401)).toContain("UNAUTHORIZED");
    expect((await counts())?.users).toBe(0);
  });

  it("14: the operator's revocation ends that User's sessions at their next request", async () => {
    const app = createApp();
    const garage = await organization("revocation-garage");
    const member = await user("member-uid");
    const other = await user("other-uid");
    await membership(garage, member, "owner");
    await membership(garage, other, "owner");
    const token = await google("member-uid", "member@example.com");
    const otherToken = await google("other-uid", "other@example.com");
    expect(data(await session(app, token))).toMatchObject({ status: "member" });
    // local-development.md's AU-05 statement, as the owner role.
    await owner.db.$client.query(
      "UPDATE users SET sessions_valid_after = now() WHERE id = $1",
      [member],
    );
    rejected(await session(app, token), 401);
    rejected(await probe(app, "user", token), 401);
    rejected(await probe(app, "viewer", token, { organization: garage }), 401);
    const failures = output
      .join("")
      .split("\n")
      .filter((line) => line.includes('"request_failed"'));
    expect(failures).toHaveLength(3);
    for (const line of failures)
      expect(line).toContain('"code":"session_revoked"');
    // Other Users keep their sessions; a fresh sign-in starts a new one.
    expect(data(await probe(app, "user", otherToken))).toEqual({ id: other });
    const fresh = await google("member-uid", "member@example.com", {
      auth_time: nowSeconds() + 2,
      iat: nowSeconds() + 2,
    });
    expect(data(await probe(app, "user", fresh))).toEqual({ id: member });
  });

  it("22: the AU-06 rebind keeps role and Memberships; the old uid gets noAccess and 403", async () => {
    const app = createApp();
    const garage = await organization("rebind-garage");
    const member = await user("lost-uid", {
      role: "global_admin",
      canEditProducts: true,
      email: "lost@example.com",
    });
    await membership(garage, member, "editor");
    const lost = await google("lost-uid", "lost@example.com");
    expect(data(await session(app, lost))).toMatchObject({ status: "member" });
    // local-development.md's AU-06 transaction, as the owner role.
    const client = await owner.db.$client.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE users SET firebase_uid = $1, email = $2, sessions_valid_after = now() WHERE id = $3",
        ["new-uid", "new@example.com", member],
      );
      await client.query("COMMIT");
    } finally {
      client.release();
    }
    const replacement = await google("new-uid", "new@example.com", {
      auth_time: nowSeconds() + 2,
      iat: nowSeconds() + 2,
      name: "Member Name",
    });
    expect(data(await session(app, replacement))).toEqual({
      status: "member",
      user: {
        id: member,
        displayName: "Member Name",
        email: "new@example.com",
        role: "global_admin",
        canEditProducts: true,
      },
      memberships: [
        {
          role: "editor",
          organization: {
            id: garage,
            name: "rebind-garage",
            nickname: "rebind-garage",
            currency: "BRL",
          },
        },
      ],
    });
    expect(data(await session(app, lost))).toEqual(noAccess);
    rejected(await probe(app, "user", lost), 403);
  });

  it("copies a Google account's changed email and name into the User row", async () => {
    const app = createApp();
    const garage = await organization("profile-garage");
    const member = await user("member-uid", { email: "old@example.com" });
    await membership(garage, member, "viewer");
    await session(
      app,
      await google("member-uid", "New@Example.com", { name: "New Name" }),
    );
    const { rows } = await database.db.$client.query(
      "SELECT email, display_name FROM users WHERE id = $1",
      [member],
    );
    expect(rows).toEqual([
      { email: "new@example.com", display_name: "New Name" },
    ]);
  });
});

describe("authorization (AU-08, AU-09, AU-11)", () => {
  async function twoOrganizations() {
    const a = await organization("garage-a");
    const b = await organization("garage-b");
    const viewer = await user("viewer-uid");
    const editor = await user("editor-uid");
    const ownerUser = await user("owner-uid");
    const outsider = await user("outsider-uid");
    await membership(a, viewer, "viewer");
    await membership(a, editor, "editor");
    await membership(a, ownerUser, "owner");
    await membership(b, outsider, "editor");
    return {
      a,
      b,
      viewer: await google("viewer-uid", "viewer@example.com"),
      editor: await google("editor-uid", "editor@example.com"),
      owner: await google("owner-uid", "owner-member@example.com"),
      outsider: await google("outsider-uid", "outsider@example.com"),
      ids: { viewer, editor, ownerUser, outsider },
    };
  }

  it("15: deleting a Membership forbids the next Organization request and the session reloads as noAccess", async () => {
    const app = createApp();
    const f = await twoOrganizations();
    expect(
      data(await probe(app, "viewer", f.viewer, { organization: f.a })),
    ).toEqual({
      organization: f.a,
      role: "viewer",
    });
    await database.db.$client.query(
      "DELETE FROM memberships WHERE user_id = $1",
      [f.ids.viewer],
    );
    rejected(await probe(app, "viewer", f.viewer, { organization: f.a }), 403);
    expect(data(await session(app, f.viewer))).toEqual(noAccess);
  });

  it("16: another or a nonexistent Organization in the header gets identical 403s", async () => {
    const app = createApp();
    const f = await twoOrganizations();
    const other = rejected(
      await probe(app, "viewer", f.viewer, { organization: f.b }),
      403,
    );
    const missing = rejected(
      await probe(app, "viewer", f.viewer, { organization: 2_147_483_647 }),
      403,
    );
    expect(other).toBe(missing);
    rejected(await probe(app, "viewer", f.viewer), 400);
  });

  it("17 and 25: another Organization's record is NOT_FOUND, like a nonexistent one; an editor needs nothing more", async () => {
    const app = createApp();
    const f = await twoOrganizations();
    const own = await event(f.a, f.ids.editor);
    const foreign = await event(f.b, f.ids.outsider);
    expect(
      data(
        await probe(app, "record", f.viewer, {
          organization: f.a,
          input: { id: own },
        }),
      ),
    ).toEqual({ id: own });
    const notFound = [foreign, 2_147_483_647].map((id) =>
      probe(app, "record", f.viewer, { organization: f.a, input: { id } }),
    );
    const [foreignBody, missingBody] = (await Promise.all(notFound)).map(
      (response) => rejected(response, 404),
    );
    expect(foreignBody).toBe(missingBody);
    // Case 25: photo management through the Organization class alone.
    expect(
      data(
        await probe(app, "editRecord", f.editor, {
          organization: f.a,
          input: { id: own },
          mutation: true,
        }),
      ),
    ).toEqual({ id: own });
    rejected(
      await probe(app, "editRecord", f.outsider, {
        organization: f.b,
        input: { id: own },
        mutation: true,
      }),
      404,
    );
  });

  it("18: each procedure requires its minimum Membership role", async () => {
    const app = createApp();
    const f = await twoOrganizations();
    const organization = f.a;
    rejected(
      await probe(app, "editor", f.viewer, { organization, mutation: true }),
      403,
    );
    rejected(
      await probe(app, "owner", f.editor, { organization, mutation: true }),
      403,
    );
    expect(
      data(
        await probe(app, "editor", f.editor, { organization, mutation: true }),
      ),
    ).toEqual({ role: "editor" });
    expect(
      data(
        await probe(app, "owner", f.owner, { organization, mutation: true }),
      ),
    ).toEqual({ role: "owner" });
  });

  it("19: a global_admin without a Membership gets platform procedures only", async () => {
    const app = createApp();
    const garage = await organization("admin-garage");
    await user("admin-uid", { role: "global_admin", canEditProducts: true });
    const admin = await google("admin-uid", "admin@example.com");
    expect(data(await probe(app, "platform", admin))).toEqual({ ok: true });
    rejected(await probe(app, "viewer", admin, { organization: garage }), 403);
    expect(data(await session(app, admin))).toEqual(noAccess);
    const f = await twoOrganizations();
    rejected(await probe(app, "platform", f.owner), 403);
  });

  it("20: only can_edit_products edits an existing Product; an editor registers a new one", async () => {
    const app = createApp();
    const f = await twoOrganizations();
    await user("product-editor-uid", { canEditProducts: true });
    rejected(await probe(app, "editProduct", f.owner, { mutation: true }), 403);
    expect(
      data(
        await probe(
          app,
          "editProduct",
          await google("product-editor-uid", "products@example.com"),
          { mutation: true },
        ),
      ),
    ).toEqual({ ok: true });
    expect(
      data(
        await probe(app, "registerProduct", f.editor, {
          organization: f.a,
          mutation: true,
        }),
      ),
    ).toEqual({ ok: true });
    rejected(
      await probe(app, "registerProduct", f.viewer, {
        organization: f.a,
        mutation: true,
      }),
      403,
    );
  });

  it("21: a custom test token needs the opt-in", async () => {
    const garage = await organization("e2e-garage");
    const testUser = await user("e2e-owner");
    await membership(garage, testUser, "owner");
    const token = await custom("e2e-owner");
    rejected(await session(createApp(), token), 401);
    expect(
      data(await session(createApp({ acceptCustomTokens: true }), token)),
    ).toMatchObject({
      status: "member",
      user: { id: testUser, email: null },
    });
  });

  it("23: a public procedure ignores an invalid token", async () => {
    const app = createApp();
    const input = encodeURIComponent(JSON.stringify({ message: "ok" }));
    for (const authorization of [
      "Bearer not.a.token",
      "Basic x",
      await google("x", "x@example.com", { exp: 1 }),
    ]) {
      expect(
        data(
          await app.inject({
            url: `/trpc/diagnostics.echo?input=${input}`,
            headers: { authorization },
          }),
        ),
      ).toEqual({ message: "ok" });
    }
  });
});
