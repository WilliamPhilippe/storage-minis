import {
  test as base,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";

// The specs' test and expect, with the tapOrClick and console fixtures
// (PW-09, PW-10).

type ConsoleKind = "error" | "warn" | "pageerror";

interface Fixtures {
  tapOrClick: (target: Locator) => Promise<void>;
  expectConsole: (kind: ConsoleKind, pattern: RegExp) => void;
}

export const test = base.extend<Fixtures>({
  // Taps on touch devices and clicks elsewhere. On Pixel 7, click() still
  // sends mouse events, so hover styles and tooltips would fire; tap() sends
  // touch, and throws without `hasTouch`.
  tapOrClick: async ({ hasTouch }, use) => {
    await use((target) => (hasTouch ? target.tap() : target.click()));
  },
  // Declares console output or a page error the test expects. Anything
  // undeclared fails the test, as in the web-unit harness.
  expectConsole: [
    async ({ context }, use) => {
      const declared: { kind: ConsoleKind; pattern: RegExp }[] = [];
      const seen: { kind: ConsoleKind; text: string }[] = [];
      context.on("console", (message) => {
        const type = message.type();
        if (type === "error" || type === "warning") {
          seen.push({
            kind: type === "warning" ? "warn" : "error",
            text: message.text(),
          });
        }
      });
      context.on("weberror", (webError) => {
        const error = webError.error();
        seen.push({ kind: "pageerror", text: error.stack ?? error.message });
      });
      await use((kind, pattern) => {
        declared.push({ kind, pattern });
      });
      const unexpected = seen
        .filter(
          ({ kind, text }) =>
            !declared.some(
              (entry) => entry.kind === kind && entry.pattern.test(text),
            ),
        )
        .map(({ kind, text }) => `${kind}: ${text}`);
      expect(unexpected, "console output the test did not declare").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

// Call once the page's heading is visible. On Pixel 7 a page that is too
// wide also zooms out, so `scrollWidth` grows past the viewport's 412 px.
export async function expectNoSidewaysScroll(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "the page scrolls sideways").toBeLessThanOrEqual(
    clientWidth,
  );
}
