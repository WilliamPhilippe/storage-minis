import { expect, expectNoSidewaysScroll, test } from "../support/app";
import { documentTitle, en, pt } from "../support/names";

const { titles } = en.app;

test.describe("back-office pages fit the viewport", () => {
  const pages = [
    { path: "/app", heading: titles.home },
    { path: "/app/inventory", heading: titles.inventory },
    { path: "/app/purchases", heading: titles.purchases },
    { path: "/app/sales", heading: titles.sales },
    { path: "/app/customers", heading: titles.customers },
    { path: "/app/payments", heading: titles.payments },
    { path: "/app/reports", heading: titles.reports },
    { path: "/app/catalog", heading: titles.catalog },
    { path: "/app/settings", heading: titles.settings },
    { path: "/app/nope", heading: en.common.notFound.title },
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

test.describe("the back office in Portuguese", () => {
  test.use({ locale: "pt-BR" });

  test("shows the shell in pt-BR", async ({ page }) => {
    await page.goto("/app/inventory");
    await expect(
      page.getByRole("heading", { level: 1, name: pt.app.titles.inventory }),
    ).toBeVisible();
    await expect(page).toHaveTitle(
      documentTitle(pt.app.titles.inventory, pt.common.brand),
    );
    await expectNoSidewaysScroll(page);
  });
});
