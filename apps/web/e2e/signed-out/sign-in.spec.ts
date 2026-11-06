import { en } from "../support/names";
import {
  hasSavedSession,
  mintCustomToken,
  signInWithToken,
  testUsers,
} from "../support/session";
import { expect, test } from "../support/test";

// Sign-in before a session exists (sign-in plan SI-11, SI-12, SI-17).

test("/app sends a signed-out visitor to /login, keeping the page", async ({
  page,
}) => {
  await page.goto("/app/sales");
  await expect(
    page.getByRole("heading", { level: 1, name: en.login.title }),
  ).toBeVisible();
  await expect(page).toHaveURL("/login?redirect=%2Fapp%2Fsales");
});

// Opens Google's real sign-in page, so it stays as short as possible: the
// popup is closed as soon as it opens (SI-17; the plan's risk on Google's
// page applies).
test("the Google button opens the dev project's sign-in popup", async ({
  page,
  tapOrClick,
  allowOrigin,
}) => {
  // Firebase's helper pages (the hidden iframe and the popup's handler) and
  // Google's api.js, which loads the iframe. Closing the popup as its
  // navigation commits keeps Google's account pages from loading (observed
  // 2026-11-06 in both projects).
  allowOrigin("https://storage-minis-dev.firebaseapp.com");
  allowOrigin("https://apis.google.com");
  await page.goto("/login");
  const popupOpened = page.waitForEvent("popup");
  await tapOrClick(page.getByRole("button", { name: en.login.action }));
  const popup = await popupOpened;
  await popup.waitForURL(
    /^https:\/\/storage-minis-dev\.firebaseapp\.com\/__\/auth\/handler\?/,
    { waitUntil: "commit" },
  );
  await popup.close();
  // Firebase notices the closed popup within about 10 s.
  await expect(page.getByRole("alert")).toHaveText(en.login.errors.cancelled, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("button", { name: en.login.action }),
  ).toBeVisible();
});

test.describe("in an in-app browser", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 380.0.0.27.82",
  });

  test("state 3 replaces the Google button (AU-12 case 24)", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { level: 1, name: en.login.inApp.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: en.login.inApp.action }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: en.login.action }),
    ).toHaveCount(0);
    await expect(page.getByText(en.login.inApp.footer)).toBeVisible();
  });
});

test("an account without access sees state 4, signed out (AU-10, case 4)", async ({
  page,
}) => {
  const token = await mintCustomToken(testUsers.outsider);
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: en.login.title }),
  ).toBeVisible();
  expect(await signInWithToken(page, token)).toBe("noAccess");
  const alert = page.getByRole("alert");
  await expect(alert).toContainText(en.login.noAccess.title);
  // A custom-token test user has no email.
  await expect(alert).toContainText(en.login.noAccess.withoutEmail);
  await expect(
    page.getByRole("button", { name: en.login.noAccess.action }),
  ).toBeVisible();
  await expect(page).toHaveURL("/login");
  expect(await hasSavedSession(page)).toBe(false);
});
