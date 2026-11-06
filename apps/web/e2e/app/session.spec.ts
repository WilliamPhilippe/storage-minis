import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../support/app";
import { en } from "../support/names";
import { hasSavedSession, ownerStatePath } from "../support/session";

// The signed-in session (T02 AU-03, AU-04, AU-12 cases 7, 8, 10 and 12;
// sign-in plan SI-10, SI-12, SI-13).

const { titles } = en.app;
const day = 24 * 60 * 60 * 1000;

function heading(page: Page, name: string): Locator {
  return page.getByRole("heading", { level: 1, name });
}

// Top right of the TopBar from bp-md; in the menu drawer's footer below it.
async function signOut(
  page: Page,
  tapOrClick: (target: Locator) => Promise<void>,
): Promise<void> {
  const name = en.app.account.signOut;
  const topBarButton = page.getByRole("banner").getByRole("button", { name });
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    await tapOrClick(topBarButton);
    return;
  }
  await tapOrClick(page.getByRole("button", { name: en.app.nav.open }));
  await tapOrClick(
    page
      .getByRole("dialog", { name: en.app.nav.menu })
      .getByRole("button", { name }),
  );
}

test.describe("the Sign out button", () => {
  test(
    "sits at the right of the TopBar",
    { tag: "@desktop" },
    async ({ page, tapOrClick }) => {
      await page.goto("/app/inventory");
      await expect(heading(page, titles.inventory)).toBeVisible();
      await tapOrClick(
        page
          .getByRole("banner")
          .getByRole("button", { name: en.app.account.signOut }),
      );
      // State 1, and Firebase's saved session is gone.
      await expect(heading(page, en.login.title)).toBeVisible();
      await expect(page).toHaveURL("/login");
      await expect(page.getByRole("alert")).toHaveCount(0);
      expect(await hasSavedSession(page)).toBe(false);
    },
  );

  test(
    "sits in the menu drawer's footer",
    { tag: "@phone" },
    async ({ page, tapOrClick }) => {
      await page.goto("/app/inventory");
      await expect(heading(page, titles.inventory)).toBeVisible();
      await expect(
        page
          .getByRole("banner")
          .getByRole("button", { name: en.app.account.signOut }),
      ).toHaveCount(0);
      await tapOrClick(page.getByRole("button", { name: en.app.nav.open }));
      await tapOrClick(
        page
          .getByRole("dialog", { name: en.app.nav.menu })
          .getByRole("button", { name: en.app.account.signOut }),
      );
      await expect(heading(page, en.login.title)).toBeVisible();
      await expect(page).toHaveURL("/login");
      expect(await hasSavedSession(page)).toBe(false);
    },
  );
});

test("sign-out reaches this browser's other tabs, not another browser (case 12)", async ({
  page,
  context,
  browser,
  baseURL,
  tapOrClick,
}) => {
  await page.goto("/app/inventory");
  await expect(heading(page, titles.inventory)).toBeVisible();
  const otherTab = await context.newPage();
  await otherTab.goto("/app/sales");
  await expect(heading(otherTab, titles.sales)).toBeVisible();
  // Another browser with the same Google session, such as a phone.
  const otherBrowser = await browser.newContext({
    ...(baseURL === undefined ? {} : { baseURL }),
    storageState: ownerStatePath,
  });
  try {
    await signOut(page, tapOrClick);
    await expect(page).toHaveURL("/login");
    // Firebase tells this browser's other tabs.
    await expect(heading(otherTab, en.login.title)).toBeVisible();
    await expect(otherTab).toHaveURL("/login?redirect=%2Fapp%2Fsales");

    const elsewhere = await otherBrowser.newPage();
    await elsewhere.goto("/app/reports");
    await expect(heading(elsewhere, titles.reports)).toBeVisible();
  } finally {
    await otherBrowser.close();
  }
});

test("8 days on, the saved session is discarded before Firebase loads it (case 10)", async ({
  page,
}) => {
  const googleRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.endsWith(".googleapis.com")) {
      googleRequests.push(request.url());
    }
  });
  await page.clock.install({ time: Date.now() + 8 * day });
  await page.goto("/app");
  await expect(heading(page, en.login.title)).toBeVisible();
  await expect(page.getByRole("alert")).toHaveText(en.login.sessionEnded);
  await expect(page).toHaveURL("/login?redirect=%2Fapp");
  expect(googleRequests).toEqual([]);
  expect(await hasSavedSession(page)).toBe(false);
});

test("61 minutes on, the token refreshes once and the API accepts it (case 7)", async ({
  page,
}) => {
  const refreshes: string[] = [];
  page.on("request", (request) => {
    if (
      new URL(request.url()).origin === "https://securetoken.googleapis.com"
    ) {
      refreshes.push(request.url());
    }
  });
  // session.get needs a valid token; diagnostics.echo is public and would
  // prove nothing.
  const sessionAnswer = page.waitForResponse(
    (response) => new URL(response.url()).pathname === "/trpc/session.get",
  );
  await page.clock.install({ time: Date.now() + 61 * 60 * 1000 });
  await page.goto("/app/inventory");
  await expect(heading(page, titles.inventory)).toBeVisible();
  expect((await sessionAnswer).status()).toBe(200);
  expect(refreshes).toHaveLength(1);
});

test("an idle tab makes no request for half an hour (case 8)", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/app/inventory");
  await expect(heading(page, titles.inventory)).toBeVisible();
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(request.url());
  });
  await page.clock.runFor("30:00");
  await expect(heading(page, titles.inventory)).toBeVisible();
  expect(requests).toEqual([]);
});
