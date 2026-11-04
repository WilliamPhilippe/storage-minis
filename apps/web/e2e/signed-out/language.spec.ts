import { en, languageNames, languageSwitchName, pt } from "../support/names";
import { expect, expectNoSidewaysScroll, test } from "../support/test";

test("switches to Português and back, and keeps the choice", async ({
  page,
  tapOrClick,
}) => {
  await page.goto("/login");
  await tapOrClick(
    page.getByRole("button", { name: languageSwitchName("en-US") }),
  );
  await tapOrClick(
    page.getByRole("menuitem", { name: languageNames["pt-BR"] }),
  );
  const ptHeading = page.getByRole("heading", {
    level: 1,
    name: pt.login.title,
  });
  await expect(ptHeading).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

  await page.reload();
  await expect(ptHeading).toBeVisible();

  await tapOrClick(
    page.getByRole("button", { name: languageSwitchName("pt-BR") }),
  );
  await tapOrClick(
    page.getByRole("menuitem", { name: languageNames["en-US"] }),
  );
  const enHeading = page.getByRole("heading", {
    level: 1,
    name: en.login.title,
  });
  await expect(enHeading).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

  await page.reload();
  await expect(enHeading).toBeVisible();
});

test.describe("a browser that prefers Portuguese", () => {
  test.use({ locale: "pt-BR" });

  test("shows the Login page and the catalog in pt-BR", async ({ page }) => {
    const pages = [
      { path: "/login", heading: pt.login.title },
      { path: "/catalog/demo", heading: pt.catalog.unavailable },
    ];
    for (const { path, heading } of pages) {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: languageSwitchName("pt-BR") }),
      ).toBeVisible();
      await expectNoSidewaysScroll(page);
    }
  });
});
