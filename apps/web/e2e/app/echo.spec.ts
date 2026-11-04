import { expect, test } from "../support/app";
import { en, fill } from "../support/names";

const echoPath = "/trpc/diagnostics.echo";

test("the API connection card shows the echo reply", async ({ page }) => {
  const response = page.waitForResponse((candidate) =>
    new URL(candidate.url()).pathname.endsWith(echoPath),
  );
  await page.goto("/app");
  const echo = await response;
  expect(echo.status()).toBe(200);
  const body = (await echo.json()) as {
    result: { data: { message: string } };
  };
  await expect(page.getByText(en.app.echo.connected)).toBeVisible();
  await expect(
    page.getByText(
      fill(en.app.echo.reply, { message: body.result.data.message }),
    ),
  ).toBeVisible();
});

// Answers the echo request as Vite's proxy does while the API is stopped,
// then recovers through the real API (PW-12).
test("the API connection card recovers through Try again", async ({
  page,
  tapOrClick,
  expectConsole,
}) => {
  await page.route(`**${echoPath}?**`, (route) =>
    route.fulfill({ status: 502, contentType: "text/plain", body: "" }),
  );
  expectConsole("error", /status of 502 \(Bad Gateway\)/);
  expectConsole("warn", /Error in route match/);
  expectConsole("error", /The above error occurred in/);
  await page.goto("/app");
  // The first request and TanStack's three retries at about 1, 2 and 4 s.
  await expect(page.getByText(en.common.errors.network)).toBeVisible({
    timeout: 15_000,
  });
  await page.unrouteAll();
  await tapOrClick(
    page.getByRole("button", { name: en.common.actions.tryAgain }),
  );
  await expect(page.getByText(en.app.echo.connected)).toBeVisible();
});
