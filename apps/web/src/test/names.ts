import common from "../i18n/en-US/common";
import { type Language, languageNames } from "../i18n/i18n";

// Accessible names built from the catalogs (W9), so tests follow the copy.

// "Language: English", or the pt-BR template's "Idioma: Português".
export function languageSwitchName(
  language: Language = "en-US",
  template: string = common.language.switch,
): string {
  return template.replace("{{name}}", languageNames[language]);
}

// document.title for a page with a title: "Inventory · StorageMinis".
export function documentTitle(title: string): string {
  return `${title} · ${common.brand}`;
}
