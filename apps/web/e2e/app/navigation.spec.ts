import type { Locator } from "@playwright/test";
import { expect, test } from "../support/app";
import { en, languageSwitchName } from "../support/names";

const { nav, titles } = en.app;

// The distances from an element's box to the viewport's right and bottom
// edges, in CSS pixels.
function edgeDistances(
  target: Locator,
): Promise<{ right: number; bottom: number }> {
  return target.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    return {
      right: clientWidth - box.right,
      bottom: clientHeight - box.bottom,
    };
  });
}

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

  test("places the button fab-offset from the edges", async ({ page }) => {
    await page.goto("/app/inventory");
    const open = page.getByRole("button", { name: nav.open });
    await expect(open).toBeVisible();
    // Pixel 7 reports no safe-area inset: 16 px from both edges.
    const { right, bottom } = await edgeDistances(open);
    expect(right).toBeCloseTo(16, 0);
    expect(bottom).toBeCloseTo(16, 0);
  });

  test("keeps the button and the language switch above the safe area", async ({
    page,
    tapOrClick,
  }) => {
    // Chromium reports no insets of its own. This experimental DevTools
    // Protocol command sets env(safe-area-inset-*): here an iPhone's 34 px
    // home indicator.
    const devTools = await page.context().newCDPSession(page);
    await devTools.send("Emulation.setSafeAreaInsetsOverride", {
      insets: { bottom: 34 },
    });
    await page.goto("/app/inventory");
    const open = page.getByRole("button", { name: nav.open });
    await expect
      .poll(async () => (await edgeDistances(open)).bottom)
      .toBeCloseTo(50, 0);

    await tapOrClick(open);
    const languageSwitch = page
      .getByRole("dialog", { name: nav.menu })
      .getByRole("button", { name: languageSwitchName("en-US") });
    // antd's 8 px footer padding plus the inset, once the drawer has slid up.
    await expect
      .poll(async () => (await edgeDistances(languageSwitch)).bottom)
      .toBeCloseTo(42, 0);
  });

  test.describe("on a short screen, at 412 × 500", () => {
    test.use({ viewport: { width: 412, height: 500 } });

    test("keeps the drawer's title and footer on screen and scrolls the menu", async ({
      page,
      tapOrClick,
    }) => {
      await page.goto("/app/inventory");
      await tapOrClick(page.getByRole("button", { name: nav.open }));
      const drawer = page.getByRole("dialog", { name: nav.menu });
      // antd's own name for the drawer's close button.
      await expect(
        drawer.getByRole("button", { name: "Close" }),
      ).toBeInViewport();
      await expect(
        drawer.getByRole("button", { name: languageSwitchName("en-US") }),
      ).toBeInViewport();
      // The drawer stops header-height-phone (56 px) below the top.
      await expect
        .poll(() =>
          drawer.evaluate((element) => element.getBoundingClientRect().top),
        )
        .toBeCloseTo(56, 0);

      const settings = drawer
        .getByRole("navigation", { name: nav.label })
        .getByRole("link", { name: titles.settings });
      await expect(settings).not.toBeInViewport();
      await tapOrClick(settings);
      await expect(page).toHaveURL("/app/settings");
      await expect(
        page.getByRole("heading", { level: 1, name: titles.settings }),
      ).toBeVisible();
    });
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
      // The saved choice, so the test doesn't depend on the default at this
      // width.
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
