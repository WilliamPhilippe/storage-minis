import enApp from "../../src/i18n/en-US/app";
import enCatalog from "../../src/i18n/en-US/catalog";
import enCommon from "../../src/i18n/en-US/common";
import enLogin from "../../src/i18n/en-US/login";
import { type Language, languageNames } from "../../src/i18n/languages";
import ptApp from "../../src/i18n/pt-BR/app";
import ptCatalog from "../../src/i18n/pt-BR/catalog";
import ptCommon from "../../src/i18n/pt-BR/common";
import ptLogin from "../../src/i18n/pt-BR/login";

// Accessible names built from the app's own catalogs (W9), so tests follow
// the copy and a misspelled key fails the type check.

export const en = {
  app: enApp,
  catalog: enCatalog,
  common: enCommon,
  login: enLogin,
};

export const pt = {
  app: ptApp,
  catalog: ptCatalog,
  common: ptCommon,
  login: ptLogin,
};

export { languageNames };

// Fills `{{name}}` placeholders, as i18next does.
export function fill(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, key: string) => {
    const value = values[key];
    if (value === undefined) {
      throw new Error(`No value for ${placeholder}.`);
    }
    return value;
  });
}

// "Language: English", or "Idioma: Português" in pt-BR.
export function languageSwitchName(language: Language): string {
  const catalog = language === "pt-BR" ? pt : en;
  return fill(catalog.common.language.switch, {
    name: languageNames[language],
  });
}

// document.title for a page with a title: "Inventory · StorageMinis".
export function documentTitle(title: string, brand = en.common.brand): string {
  return `${title} · ${brand}`;
}
