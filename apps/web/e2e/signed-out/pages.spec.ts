import { en, languageSwitchName } from "../support/names";
import { expect, expectNoSidewaysScroll, test } from "../support/test";

// Signing in: signed-out/sign-in.spec.ts.
test("the Login page", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: en.login.title }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: languageSwitchName("en-US") }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: en.login.action }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(en.login.helper);
});

test("the catalog placeholder", async ({ page }) => {
  // The catalog never loads Firebase (sign-in plan SI-09): no Firebase
  // module, from Vite's dependencies or ours, and no request to Google.
  const firebaseRequests: string[] = [];
  page.on("request", (request) => {
    if (/firebase|googleapis\.com/.test(request.url())) {
      firebaseRequests.push(request.url());
    }
  });
  await page.goto("/catalog/demo");
  await expect(
    page.getByRole("heading", { level: 1, name: en.catalog.unavailable }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: languageSwitchName("en-US") }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: en.app.nav.label }),
  ).toHaveCount(0);
  expect(firebaseRequests).toEqual([]);
});

test.describe("signed-out pages fit the viewport", () => {
  const pages = [
    { path: "/login", heading: en.login.title },
    { path: "/catalog/demo", heading: en.catalog.unavailable },
    { path: "/nope", heading: en.common.notFound.title },
  ];
  for (const { path, heading } of pages) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      await expectNoSidewaysScroll(page);
    });
  }
});

test("every project pins en-US and America/Sao_Paulo", async ({ page }) => {
  await page.goto("/login");
  const settings = await page.evaluate(() => ({
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    day: new Date("2026-11-01T01:00:00Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
  expect(settings).toEqual({
    language: "en-US",
    timeZone: "America/Sao_Paulo",
    day: "Oct 31",
  });
});
