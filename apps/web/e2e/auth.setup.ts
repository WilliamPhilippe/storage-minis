import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { en } from "./support/names";
import {
  mintCustomToken,
  ownerStatePath,
  prepareAndSeed,
  signInWithToken,
  testUsers,
} from "./support/session";
import { expect, test as setup } from "./support/test";

// The setup project (sign-in plan SI-17): runs once before desktop-chrome
// and pixel-7, which reuse the saved session through support/app.ts.
setup("sign in the e2e owner and save the session", async ({ page }) => {
  await prepareAndSeed();
  const token = await mintCustomToken(testUsers.owner);

  await page.goto("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: en.login.title }),
  ).toBeVisible();
  expect(await signInWithToken(page, token)).toBe("member");
  await page.waitForURL("/app");
  await expect(
    page.getByRole("heading", { level: 1, name: en.app.titles.home }),
  ).toBeVisible();

  // Firebase keeps the session in IndexedDB (PW-13).
  mkdirSync(dirname(ownerStatePath), { recursive: true });
  await page.context().storageState({ path: ownerStatePath, indexedDB: true });
});
