import { describe, expect, it } from "vitest";
import { catalogSymbol, formatMoney } from "./money";

describe("formatMoney", () => {
  it.each([
    [40000, "$400"],
    [40050, "$400.50"],
    [123450, "$1,234.50"],
    [-40050, "-$400.50"],
    [0, "$0"],
    [5, "$0.05"],
  ])("formats %i cents in en-US as %s", (cents, expected) => {
    expect(formatMoney(cents, "en-US")).toBe(expected);
  });

  it.each([
    [40000, "$400"],
    [40050, "$400,50"],
    [123450, "$1.234,50"],
    [-40050, "-$400,50"],
  ])("formats %i cents in pt-BR as %s", (cents, expected) => {
    expect(formatMoney(cents, "pt-BR")).toBe(expected);
  });

  it("shows the Organization's symbol in the catalog", () => {
    expect(formatMoney(123450, "pt-BR", catalogSymbol("BRL"))).toBe(
      "R$1.234,50",
    );
    expect(formatMoney(123450, "en-US", catalogSymbol("USD"))).toBe(
      "US$1,234.50",
    );
  });

  it("formats the int32 limits exactly", () => {
    expect(formatMoney(2147483647, "en-US")).toBe("$21,474,836.47");
    expect(formatMoney(-2147483648, "en-US")).toBe("-$21,474,836.48");
    expect(formatMoney(2147483647, "pt-BR")).toBe("$21.474.836,47");
  });

  it("formats the largest safe integer with no floating-point step", () => {
    expect(formatMoney(Number.MAX_SAFE_INTEGER, "en-US")).toBe(
      "$90,071,992,547,409.91",
    );
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53])(
    "rejects %s, which is not a safe integer of cents",
    (cents) => {
      expect(() => formatMoney(cents, "en-US")).toThrow(RangeError);
    },
  );
});
