import { theme as antdTheme } from "antd";
import { describe, expect, it } from "vitest";
import { phoneTheme, theme } from "./theme";

// WCAG relative luminance of a #rrggbb color.
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  );
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

describe.each([
  ["desktop", theme],
  ["phone", phoneTheme],
])("the %s theme's selected backgrounds", (_name, config) => {
  const tokens = antdTheme.getDesignToken(config);

  it("use surface-sunken, then line on hover, instead of the ink palette", () => {
    expect(tokens.controlItemBgActive).toBe("#eef0f3");
    expect(tokens.controlItemBgActiveHover).toBe("#e3e6ea");
  });

  it("keep ink text above 4.5:1", () => {
    for (const background of [
      tokens.controlItemBgActive,
      tokens.controlItemBgActiveHover,
    ]) {
      expect(contrast(tokens.colorText, background)).toBeGreaterThan(4.5);
    }
  });
});
