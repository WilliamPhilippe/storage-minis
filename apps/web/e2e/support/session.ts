import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import type { Page } from "@playwright/test";
import { createDatabase, readDatabaseConfig, schema } from "@storage-minis/db";
import { prepareTestDatabase } from "@storage-minis/db/testing";
import {
  applicationDefault,
  deleteApp,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Playwright's test sign-in (sign-in plan SI-15 and SI-17): the test
// database's seed, custom tokens minted through IAM, and the development
// hook. Runs in Node, in the setup project and the specs' workers.

/** The session the /app specs start with (PW-13). Ignored by git. */
export const ownerStatePath = fileURLToPath(
  new URL("../../playwright/.auth/owner.json", import.meta.url),
);

/** Test users have `e2e-` uids, the only custom tokens the API accepts. */
export const testUsers = {
  /** "E2E Owner", an owner of "E2E Garage". */
  owner: "e2e-owner",
  /** No User row: the Login page's state 4. */
  outsider: "e2e-outsider",
} as const;

export const testOrganization = {
  name: "E2E Garage",
  nickname: "e2e-garage",
  currency: "BRL",
} as const;

// .env.test, parsed rather than loaded (PW-06); a real environment value
// wins, as in playwright.config.mts.
function testValue(name: string): string | undefined {
  const file = fileURLToPath(new URL("../../../../.env.test", import.meta.url));
  const values = existsSync(file) ? parseEnv(readFileSync(file, "utf8")) : {};
  return process.env[name] ?? values[name];
}

/**
 * Resets and migrates the test database with the shared helper, then seeds
 * the Organization, its owner and the Membership as the app role.
 */
export async function prepareAndSeed(): Promise<void> {
  const databaseUrl = testValue("DATABASE_URL");
  await prepareTestDatabase({
    databaseUrl,
    // Read here only, so the servers never receive the owner role's URL.
    migrationDatabaseUrl: testValue("MIGRATION_DATABASE_URL"),
  });
  const database = createDatabase(
    readDatabaseConfig({ DATABASE_URL: databaseUrl }),
  );
  try {
    await database.db.transaction(async (tx) => {
      const [organization] = await tx
        .insert(schema.organizations)
        .values(testOrganization)
        .returning({ id: schema.organizations.id });
      const [user] = await tx
        .insert(schema.users)
        .values({ firebaseUid: testUsers.owner, displayName: "E2E Owner" })
        .returning({ id: schema.users.id });
      if (organization === undefined || user === undefined) {
        throw new Error("The test seed inserted no rows.");
      }
      await tx.insert(schema.memberships).values({
        organizationId: organization.id,
        userId: user.id,
        role: "owner",
        grantedAt: new Date(),
      });
    });
  } finally {
    await database.close();
  }
}

/**
 * A Firebase custom token for a test user, signed through IAM as the no-role
 * `e2e-custom-tokens` service account with the developer's gcloud
 * Application Default Credentials (SI-15). Without them, this fails first,
 * with Google's message; see the README's setup.
 */
export async function mintCustomToken(uid: string): Promise<string> {
  const projectId = testValue("FIREBASE_PROJECT_ID");
  const serviceAccountId = testValue("E2E_SIGNER_SERVICE_ACCOUNT");
  if (projectId === undefined || serviceAccountId === undefined) {
    throw new Error(
      "Set FIREBASE_PROJECT_ID and E2E_SIGNER_SERVICE_ACCOUNT in .env.test.",
    );
  }
  const app = initializeApp(
    { credential: applicationDefault(), projectId, serviceAccountId },
    `e2e-${uid}-${Date.now()}`,
  );
  try {
    return await getAuth(app).createCustomToken(uid);
  } finally {
    await deleteApp(app);
  }
}

declare global {
  interface Window {
    __storageMinisTest?: { signIn(token: string): Promise<string> };
  }
}

/**
 * Signs in through the development-only hook on the page, which must be on
 * /login. Resolves with the outcome: "member" or "noAccess".
 */
export async function signInWithToken(
  page: Page,
  token: string,
): Promise<string> {
  await page.waitForFunction(() => window.__storageMinisTest !== undefined);
  return page.evaluate(async (customToken) => {
    const hook = window.__storageMinisTest;
    if (hook === undefined) {
      throw new Error("The development sign-in hook is missing.");
    }
    return hook.signIn(customToken);
  }, token);
}

/** Whether Firebase's saved session is still in this browser context. */
export async function hasSavedSession(page: Page): Promise<boolean> {
  const state = await page.context().storageState({ indexedDB: true });
  return JSON.stringify(state).includes("firebase:authUser:");
}
