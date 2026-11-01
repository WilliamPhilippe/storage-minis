import type { Language } from "../../i18n/i18n";

// The back office always shows `$`; the public catalog shows the
// Organization's symbol (W4).
export type MoneySymbol = "$" | "R$" | "US$";

const formatters = new Map<Language, Intl.NumberFormat>();

function formatter(language: Language): Intl.NumberFormat {
  let numberFormat = formatters.get(language);
  if (!numberFormat) {
    numberFormat = new Intl.NumberFormat(language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      trailingZeroDisplay: "stripIfInteger",
    });
    formatters.set(language, numberFormat);
  }
  return numberFormat;
}

// Formats integer cents with no floating-point step: integer arithmetic
// builds the exact decimal string ("1234.50"), and `Intl.NumberFormat`
// formats a string as an exact decimal. Cents show only when they aren't
// zero, and the sign goes before the symbol: `-$400.50`.
export function formatMoney(
  cents: number,
  language: Language,
  symbol: MoneySymbol = "$",
): string {
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError(`Money must be a safe integer of cents: ${cents}`);
  }
  const absolute = Math.abs(cents);
  const rest = absolute % 100;
  const whole = (absolute - rest) / 100;
  const decimal =
    `${whole}.${String(rest).padStart(2, "0")}` as Intl.StringNumericLiteral;
  const sign = cents < 0 ? "-" : "";
  return `${sign}${symbol}${formatter(language).format(decimal)}`;
}

export function catalogSymbol(currency: "BRL" | "USD"): MoneySymbol {
  return currency === "BRL" ? "R$" : "US$";
}
