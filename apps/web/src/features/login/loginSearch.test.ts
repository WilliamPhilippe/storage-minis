import { describe, expect, it } from "vitest";
import { appRedirect, validateLoginSearch } from "./loginSearch";

describe("the Login page's redirect parameter", () => {
  it.each(["/app", "/app/sales", "/app/sales?page=2", "/app#top", "/app/"])(
    "keeps %s",
    (redirect) => {
      expect(validateLoginSearch({ redirect })).toEqual({ redirect });
    },
  );

  it.each([
    ["another site", "https://example.com/app"],
    ["a protocol-relative URL", "//example.com/app"],
    ["a page outside /app", "/catalog/demo"],
    ["a path that only starts like /app", "/apple"],
    ["backslashes", "/app\\..\\..\\evil"],
    ["a number", 42],
    ["nothing", undefined],
  ])("drops %s", (_case, redirect) => {
    // An explicit undefined: TanStack Router merges the URL's raw search into
    // each match, so a missing key would let the refused value through.
    expect(validateLoginSearch({ redirect })).toStrictEqual({
      redirect: undefined,
    });
    expect(appRedirect(redirect)).toBeUndefined();
  });

  it("drops an overlong value", () => {
    expect(
      validateLoginSearch({ redirect: `/app/${"a".repeat(2048)}` }),
    ).toStrictEqual({ redirect: undefined });
  });

  it("ignores other parameters", () => {
    expect(validateLoginSearch({ redirect: "/app", other: "x" })).toEqual({
      redirect: "/app",
    });
  });
});
