import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@storage-minis/db";
import type { FastifyInstance, LightMyRequestResponse } from "fastify";
import {
  access,
  fakeStore,
  googleIdentity,
  storedUser,
} from "../../tests/auth-fakes.js";
import type { FakeStore } from "../../tests/auth-fakes.js";
import { buildApp } from "../app.js";
import { IdentityRejected } from "../auth/errors.js";
import type { AuthDependencies, IdTokenVerifier } from "../auth/types.js";
import type { ApiConfig } from "../config.js";
import { t } from "./init.js";
import { trpcRoutes } from "./plugin.js";
import {
  identityProcedure,
  organizationProcedure,
  platformProcedure,
  requireCanEditProducts,
  userProcedure,
} from "./procedures.js";

// The guarded builders, like every tRPC module, import only the DB's types.
vi.mock("@storage-minis/db", () => {
  throw new Error("The tRPC modules must import only the database type.");
});

const httpConfig: ApiConfig["http"] = {
  host: "127.0.0.1",
  port: 3000,
  logLevel: "trace",
  nodeEnv: "test",
};
const db = {} as Database["db"];
const token = "Bearer TOKEN_SENTINEL.PAYLOAD_SENTINEL.SIGNATURE_SENTINEL";
const identity = googleIdentity({ email: "EMAIL_SENTINEL@example.com" });

// Test-only probes, one per class and role (SI-16); never in appRouter.
const probeRouter = t.router({
  identity: identityProcedure.query(({ ctx }) => ({ uid: ctx.identity.uid })),
  user: userProcedure.query(({ ctx }) => ({ user: ctx.user })),
  viewer: organizationProcedure("viewer").query(({ ctx }) => ({
    organization: ctx.organization,
    membership: ctx.membership,
  })),
  editor: organizationProcedure("editor").mutation(({ ctx }) => ({
    role: ctx.membership.role,
  })),
  owner: organizationProcedure("owner").query(({ ctx }) => ({
    role: ctx.membership.role,
  })),
  platform: platformProcedure.query(() => ({ ok: true as const })),
  editProduct: userProcedure.mutation(({ ctx }) => {
    requireCanEditProducts(ctx.user);
    return { ok: true as const };
  }),
});

const apps: FastifyInstance[] = [];
let output: string[];
let verify: ReturnType<typeof vi.fn<IdTokenVerifier["verify"]>>;
let store: FakeStore;

function createApp() {
  const auth: AuthDependencies = {
    verifier: { verify },
    store,
    bootstrap: null,
  };
  const app = buildApp(httpConfig, {
    database: { db, check: vi.fn<() => Promise<void>>().mockResolvedValue() },
    isClosing: () => false,
    auth,
  });
  void app.register(trpcRoutes, {
    prefix: "/trpc-probe",
    router: probeRouter,
    db,
    auth,
  });
  apps.push(app);
  return app;
}

function call(
  path: string,
  headers: Record<string, string> = { authorization: token },
  mutation = false,
) {
  return createApp().inject({
    method: mutation ? "POST" : "GET",
    url: `/trpc-probe/${path}`,
    headers: mutation
      ? { ...headers, "content-type": "application/json" }
      : headers,
  });
}

type LogRecord = Record<string, unknown> & {
  err?: { type?: string; code?: string; cause?: Record<string, unknown> };
};

function failure(): LogRecord {
  const found = output
    .join("")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as LogRecord)
    .filter((log) => log.msg === "request_failed");
  expect(found).toHaveLength(1);
  return found[0] as LogRecord;
}

/** The fixed envelope, and one `request_failed` with the reason's code. */
function expectRejected(
  response: LightMyRequestResponse,
  status: 400 | 401 | 403,
  reason: string,
  procedure: string,
) {
  const code = { 400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN" }[
    status
  ];
  expect(response.statusCode).toBe(status);
  expect(response.json()).toEqual({
    error: {
      message: {
        400: "Invalid request",
        401: "Unauthorized",
        403: "Forbidden",
      }[status],
      code: { 400: -32600, 401: -32001, 403: -32003 }[status],
      data: { code, httpStatus: status },
    },
  });
  expect(failure()).toMatchObject({
    level: 30,
    category: code.toLowerCase(),
    status,
    procedure,
    err: {
      type: "TRPCError",
      code,
      cause: {
        type: status === 401 ? "IdentityRejected" : "AccessDenied",
        code: reason,
      },
    },
  });
}

beforeEach(() => {
  output = [];
  vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    output.push(String(chunk));
    return true;
  });
  verify = vi.fn<IdTokenVerifier["verify"]>().mockResolvedValue(identity);
  store = fakeStore();
});

afterEach(async () => {
  try {
    // No log line carries the token, the email or a header value (SI-06).
    const logs = output.join("");
    for (const value of ["TOKEN_SENTINEL", "EMAIL_SENTINEL", "HEADER_SENTINEL"])
      expect(logs).not.toContain(value);
    for (const app of apps) await app.close();
  } finally {
    apps.length = 0;
    vi.restoreAllMocks();
  }
});

describe("guarded procedure builders", () => {
  it("verifies the raw authorization header and adds the identity", async () => {
    const response = await call("identity");
    expect(response.json()).toEqual({
      result: { data: { uid: "google-uid-1" } },
    });
    expect(verify).toHaveBeenCalledExactlyOnceWith(token);
  });

  it("answers a refused token with UNAUTHORIZED and logs only its reason", async () => {
    verify.mockRejectedValue(new IdentityRejected("token_expired"));
    expectRejected(await call("identity"), 401, "token_expired", "identity");
  });

  it("answers a key-source failure with a 500, so nobody is signed out", async () => {
    verify.mockRejectedValue(
      new Error("Google's key set is unavailable.", {
        cause: Object.assign(new Error("timeout"), {
          code: "ERR_JWKS_TIMEOUT",
        }),
      }),
    );
    const response = await call("identity");
    expect(response.statusCode).toBe(500);
    expect(response.json<{ error: { data: unknown } }>().error.data).toEqual({
      code: "INTERNAL_SERVER_ERROR",
      httpStatus: 500,
    });
    expect(failure()).toMatchObject({
      level: 50,
      category: "internal_error",
      procedure: "identity",
      err: {
        type: "TRPCError",
        cause: { type: "Error", cause: { code: "ERR_JWKS_TIMEOUT" } },
      },
    });
  });

  it("requires a User row for the uid and passes only its access fields", async () => {
    store.findUser.mockResolvedValueOnce(undefined);
    expectRejected(await call("user"), 403, "user_missing", "user");
    output = [];
    store.findUser.mockResolvedValueOnce(
      storedUser({ role: "global_admin", canEditProducts: true }),
    );
    const response = await call("user");
    expect(response.json()).toEqual({
      result: {
        data: { user: { id: 7, role: "global_admin", canEditProducts: true } },
      },
    });
    expect(store.findUser).toHaveBeenLastCalledWith("google-uid-1");
  });

  it("refuses a session signed in no later than the revocation cutoff's second", async () => {
    // A cutoff 400 ms into the sign-in's own second (AU-05).
    store.findUser.mockResolvedValue(
      storedUser({
        sessionsValidAfter: new Date(identity.authTime * 1000 + 400),
      }),
    );
    expectRejected(await call("user"), 401, "session_revoked", "user");
    output = [];
    store.findUser.mockResolvedValue(
      storedUser({
        sessionsValidAfter: new Date((identity.authTime - 1) * 1000),
      }),
    );
    expect((await call("user")).statusCode).toBe(200);
  });

  it("requires a valid x-organization-id before reading any Membership", async () => {
    store.findUser.mockResolvedValue(storedUser());
    for (const value of [
      undefined,
      "",
      "0",
      "-1",
      "01",
      "1.5",
      "HEADER_SENTINEL",
    ]) {
      output = [];
      const headers: Record<string, string> = { authorization: token };
      if (value !== undefined) headers["x-organization-id"] = value;
      expectRejected(
        await call("viewer", headers),
        400,
        "organization_header_invalid",
        "viewer",
      );
    }
    expect(store.findMembership).not.toHaveBeenCalled();
  });

  it("answers a missing Membership identically for any Organization ID", async () => {
    store.findUser.mockResolvedValue(storedUser());
    store.findMembership.mockResolvedValue(undefined);
    const bodies = [];
    for (const id of ["12", "2147483647"]) {
      output = [];
      const response = await call("viewer", {
        authorization: token,
        "x-organization-id": id,
      });
      expectRejected(response, 403, "membership_missing", "viewer");
      bodies.push(response.body);
    }
    expect(bodies[0]).toBe(bodies[1]);
    expect(store.findMembership.mock.calls).toEqual([
      [7, 12],
      [7, 2_147_483_647],
    ]);
  });

  it("enforces each procedure's minimum Membership role", async () => {
    store.findUser.mockResolvedValue(storedUser());
    const headers = { authorization: token, "x-organization-id": "11" };
    const cases = [
      ["viewer", "viewer", 200],
      ["viewer", "editor", 403],
      ["editor", "editor", 200],
      ["editor", "owner", 403],
      ["owner", "owner", 200],
      ["owner", "editor", 200],
    ] as const;
    for (const [role, procedure, status] of cases) {
      output = [];
      store.findMembership.mockResolvedValueOnce(access(role));
      const response = await call(procedure, headers, procedure === "editor");
      if (status === 200) {
        const { data } = response.json<{
          result: { data: { role?: string; membership?: { role: string } } };
        }>().result;
        expect(data.role ?? data.membership?.role).toBe(role);
      } else {
        expectRejected(response, 403, "role_too_low", procedure);
      }
    }
  });

  it("adds the Organization's ID and currency and the Membership role", async () => {
    store.findUser.mockResolvedValue(storedUser());
    store.findMembership.mockResolvedValue(access("viewer"));
    const response = await call("viewer", {
      authorization: token,
      "x-organization-id": "11",
    });
    expect(response.json()).toEqual({
      result: {
        data: {
          organization: { id: 11, currency: "BRL" },
          membership: { role: "viewer" },
        },
      },
    });
    // One indexed read per class step.
    expect(store.findUser).toHaveBeenCalledTimes(1);
    expect(store.findMembership).toHaveBeenCalledTimes(1);
  });

  it("limits platform procedures to a global_admin, without any Membership", async () => {
    store.findUser.mockResolvedValueOnce(storedUser({ role: "editor" }));
    expectRejected(
      await call("platform"),
      403,
      "global_admin_required",
      "platform",
    );
    store.findUser.mockResolvedValueOnce(storedUser({ role: "global_admin" }));
    expect((await call("platform")).json()).toEqual({
      result: { data: { ok: true } },
    });
    expect(store.findMembership).not.toHaveBeenCalled();
  });

  it("lets only can_edit_products edit an existing Product", async () => {
    store.findUser.mockResolvedValueOnce(
      storedUser({ role: "global_admin", canEditProducts: false }),
    );
    expectRejected(
      await call("editProduct", { authorization: token }, true),
      403,
      "product_edit_required",
      "editProduct",
    );
    store.findUser.mockResolvedValueOnce(storedUser({ canEditProducts: true }));
    expect(
      (await call("editProduct", { authorization: token }, true)).statusCode,
    ).toBe(200);
  });

  it("never verifies a token for a public procedure", async () => {
    const app = createApp();
    const response = await app.inject({
      url: `/trpc/diagnostics.echo?input=${encodeURIComponent(JSON.stringify({ message: "ok" }))}`,
      headers: { authorization: "Bearer not.a-valid.token" },
    });
    expect(response.statusCode).toBe(200);
    expect(verify).not.toHaveBeenCalled();
  });
});
