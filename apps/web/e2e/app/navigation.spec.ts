import { expect, test } from "../support/app";
import { en, languageSwitchName } from "../support/names";

const { nav, titles } = en.app;

test.describe("the phone menu", { tag: "@phone" }, () => {
  test("opens the drawer and navigates", async ({ page, tapOrClick }) => {
    await page.goto("/app");
    const open = page.getByRole("button", { name: nav.open });
    await expect(open).toHaveAttribute("aria-expanded", "false");
    await tapOrClick(open);

    const drawer = page.getByRole("dialog", { name: nav.menu });
    await expect(drawer).toBeVisible();
    await expect(open).toHaveAttribute("aria-expanded", "true");
    await expect(
      drawer.getByRole("button", { name: languageSwitchName("en-US") }),
    ).toBeVisible();

    await tapOrClick(
      drawer
        .getByRole("navigation", { name: nav.label })
        .getByRole("link", { name: titles.inventory }),
    );
    await expect(page).toHaveURL("/app/inventory");
    await expect(
      page.getByRole("heading", { level: 1, name: titles.inventory }),
    ).toBeVisible();
    await expect(drawer).toBeHidden();
  });
});

test.describe("the SideNav", { tag: "@desktop" }, () => {
  test("navigates, collapses and keeps the choice", async ({
    page,
    tapOrClick,
  }) => {
    await page.goto("/app");
    await tapOrClick(
      page
        .getByRole("navigation", { name: nav.label })
        .getByRole("link", { name: titles.sales }),
    );
    await expect(page).toHaveURL("/app/sales");
    await expect(
      page.getByRole("heading", { level: 1, name: titles.sales }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: languageSwitchName("en-US") }),
    ).toBeVisible();

    await tapOrClick(page.getByRole("button", { name: nav.collapse }));
    const expand = page.getByRole("button", { name: nav.expand });
    await expect(expand).toBeVisible();
    await page.reload();
    await expect(expand).toBeVisible();

    await tapOrClick(expand);
    await expect(
      page.getByRole("button", { name: nav.collapse }),
    ).toBeVisible();
  });

  test.describe("collapsed, at 900 × 720", () => {
    test.use({ viewport: { width: 900, height: 720 } });

    test("navigates from the collapsed SideNav", async ({
      page,
      tapOrClick,
    }) => {
      // The saved choice, so the test holds whatever the default at this
      // width becomes (the web shell follow-up).
      await page.addInitScript(() => {
        localStorage.setItem("storage-minis.sideNav", "collapsed");
      });
      await page.goto("/app");
      await expect(
        page.getByRole("button", { name: nav.expand }),
      ).toBeVisible();
      await tapOrClick(
        page
          .getByRole("navigation", { name: nav.label })
          .getByRole("link", { name: titles.reports }),
      );
      await expect(page).toHaveURL("/app/reports");
      await expect(
        page.getByRole("heading", { level: 1, name: titles.reports }),
      ).toBeVisible();
    });
  });
});
