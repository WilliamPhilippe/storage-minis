import { describe, expect, it } from "vitest";
import { formatDateTime, formatShortDate } from "./date";

// 01:00 UTC on Nov 1 is still Oct 31 in America/Sao_Paulo (UTC-3), the time
// zone the tests run in.
const instant = new Date("2026-11-01T01:00:00Z");

describe("date formatting", () => {
  it("runs in the visitor's time zone", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      "America/Sao_Paulo",
    );
  });

  it("formats a short date in the visitor's time zone", () => {
    expect(formatShortDate(instant, "en-US")).toBe("Oct 31");
    expect(formatShortDate(instant, "pt-BR")).toBe("31 de out.");
  });

  it("formats a date with its time in the visitor's time zone", () => {
    expect(formatDateTime(instant, "en-US")).toBe("Oct 31, 2026, 10:00 PM");
    expect(formatDateTime(instant, "pt-BR")).toBe("31 de out. de 2026, 22:00");
  });
});
