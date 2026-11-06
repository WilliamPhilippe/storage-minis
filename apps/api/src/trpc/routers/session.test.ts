import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@storage-minis/db";
import type { FastifyInstance } from "fastify";
import {
  access,
  fakeStore,
  googleIdentity,
  storedUser,
} from "../../../tests/auth-fakes.js";
import type { FakeStore } from "../../../tests/auth-fakes.js";
import { buildApp } from "../../app.js";
import type {
  BootstrapSettings,
  IdTokenVerifier,
  VerifiedIdentity,
} from "../../auth/types.js";
import type { ApiConfig } from "../../config.js";

// The session router reaches the database only through the injected store.
vi.mock("@storage-minis/db", () => {
  throw new Error("The tRPC modules must import only the database type.");
});

const httpConfig: ApiConfig["http"] = {
  host: "127.0.0.1",
  port: 3000,
  logLevel: "silent",
  nodeEnv: "test",
};
const settings: BootstrapSettings = {
  ownerEmail: "owner@example.com",
  organization: { name: "Garage", nickname: "garage", currency: "BRL" },
};
const apps: FastifyInstance[] = [];
let store: FakeStore;

async function sessionFor(
  identity: VerifiedIdentity,
  bootstrap: BootstrapSettings | null = null,
) {
  const verify = vi.fn<IdTokenVerifier["verify"]>().mockResolvedValue(identity);
  const app = buildApp(httpConfig, {
    database: {
      db: {} as Database["db"],
      check: vi.fn<() => Promise<void>>().mockResolvedValue(),
    },
    isClosing: () => false,
    auth: { verifier: { verify }, store, bootstrap },
  });
  apps.push(app);
  const response = await app.inject({
    url: "/trpc/session.get",
    headers: { authorization: "Bearer a.b.c" },
  });
  return { status: response.statusCode, body: response.json<unknown>() };
}

const noAccess = {
  status: 200,
  body: { result: { data: { status: "noAccess" } } },
};

beforeEach(() => {
  store = fakeStore();
});

afterEach(async () => {
  try {
    for (const app of apps) await app.close();
  } finally {
    apps.length = 0;
  }
});

describe("session.get", () => {
  it("answers a member with the User and every Membership, nothing more", async () => {
    store.findUser.mockResolvedValue(
      storedUser({
        role: "global_admin",
        canEditProducts: true,
        sessionsValidAfter: new Date(0),
      }),
    );
    store.listMemberships.mockResolvedValue([
      access("owner", 11),
      access("viewer", 12),
    ]);
    expect(await sessionFor(googleIdentity())).toEqual({
      status: 200,
      body: {
        result: {
          data: {
            status: "member",
            user: {
              id: 7,
              displayName: "Member Name",
              email: "member@example.com",
              role: "global_admin",
              canEditProducts: true,
            },
            memberships: [
              {
                role: "owner",
                organization: {
                  id: 11,
                  name: "Garage 11",
                  nickname: "garage-11",
                  currency: "BRL",
                },
              },
              {
                role: "viewer",
                organization: {
                  id: 12,
                  name: "Garage 12",
                  nickname: "garage-12",
                  currency: "BRL",
                },
              },
            ],
          },
        },
      },
    });
    expect(store.listMemberships).toHaveBeenCalledExactlyOnceWith(7);
    expect(store.refreshProfile).not.toHaveBeenCalled();
  });

  it("answers noAccess for a User without Memberships, a global_admin included", async () => {
    for (const role of ["user", "global_admin"] as const) {
      store.findUser.mockResolvedValue(storedUser({ role }));
      store.listMemberships.mockResolvedValue([]);
      expect(await sessionFor(googleIdentity())).toEqual(noAccess);
    }
  });

  it("refuses a revoked session before reading Memberships", async () => {
    const identity = googleIdentity();
    store.findUser.mockResolvedValue(
      storedUser({ sessionsValidAfter: new Date(identity.authTime * 1000) }),
    );
    const { status } = await sessionFor(identity);
    expect(status).toBe(401);
    expect(store.listMemberships).not.toHaveBeenCalled();
    expect(store.refreshProfile).not.toHaveBeenCalled();
  });

  it("copies a Google token's changed email and name, lowercasing the email", async () => {
    store.findUser.mockResolvedValue(storedUser());
    store.refreshProfile.mockResolvedValue(
      storedUser({ email: "new@example.com", displayName: "New Name" }),
    );
    store.listMemberships.mockResolvedValue([access("editor")]);
    const { body } = await sessionFor(
      googleIdentity({ email: "New@Example.com", name: "New Name" }),
    );
    expect(store.refreshProfile).toHaveBeenCalledExactlyOnceWith(7, {
      email: "new@example.com",
      displayName: "New Name",
    });
    expect(body).toMatchObject({
      result: {
        data: { user: { email: "new@example.com", displayName: "New Name" } },
      },
    });
  });

  it("changes nothing for an unchanged profile or a custom test token", async () => {
    store.findUser.mockResolvedValue(storedUser());
    store.listMemberships.mockResolvedValue([access("owner")]);
    await sessionFor(googleIdentity({ email: " MEMBER@example.com" }));
    await sessionFor(
      googleIdentity({
        uid: "e2e-owner",
        provider: "custom",
        email: null,
        emailVerified: false,
        name: null,
      }),
    );
    expect(store.refreshProfile).not.toHaveBeenCalled();
  });

  it("bootstraps the configured owner's first verified Google sign-in", async () => {
    const owner = googleIdentity({
      uid: "owner-uid",
      email: "Owner@Example.com",
    });
    store.findUser.mockResolvedValue(undefined);
    store.bootstrap.mockResolvedValue(
      storedUser({ id: 1, role: "global_admin", canEditProducts: true }),
    );
    store.listMemberships.mockResolvedValue([access("owner", 1)]);
    const { body } = await sessionFor(owner, settings);
    expect(store.bootstrap).toHaveBeenCalledExactlyOnceWith(owner, settings);
    expect(store.listMemberships).toHaveBeenCalledExactlyOnceWith(1);
    expect(body).toMatchObject({ result: { data: { status: "member" } } });
  });

  it("answers noAccess when the bootstrap finds an Organization", async () => {
    store.findUser.mockResolvedValue(undefined);
    store.bootstrap.mockResolvedValue(undefined);
    expect(
      await sessionFor(
        googleIdentity({ email: "owner@example.com" }),
        settings,
      ),
    ).toEqual(noAccess);
    expect(store.listMemberships).not.toHaveBeenCalled();
  });

  it("never bootstraps another account, an unverified email, a custom token or without settings", async () => {
    store.findUser.mockResolvedValue(undefined);
    for (const [identity, configured] of [
      [googleIdentity({ email: "someone@example.com" }), settings],
      [
        googleIdentity({ email: "owner@example.com", emailVerified: false }),
        settings,
      ],
      [
        googleIdentity({
          uid: "e2e-owner",
          email: "owner@example.com",
          provider: "custom",
        }),
        settings,
      ],
      [googleIdentity({ email: "owner@example.com" }), null],
    ] as const) {
      expect(await sessionFor(identity, configured)).toEqual(noAccess);
    }
    // AU-10: an account without a User row writes nothing.
    expect(store.bootstrap).not.toHaveBeenCalled();
    expect(store.refreshProfile).not.toHaveBeenCalled();
  });
});
