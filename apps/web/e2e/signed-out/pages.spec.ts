import { expect, test } from "../support/test";

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
