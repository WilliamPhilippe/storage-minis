// No imports: the end-to-end tests read these names in Node, where the antd,
// dayjs and i18next imports in i18n.ts would not resolve.
export const languages = ["en-US", "pt-BR"] as const;
export type Language = (typeof languages)[number];

// Each language's name in its own language, the same in every catalog.
export const languageNames: Record<Language, string> = {
  "en-US": "English",
  "pt-BR": "Português",
};

// The short label the language switch shows.
export const languageCodes: Record<Language, string> = {
  "en-US": "EN",
  "pt-BR": "PT",
};

export function isLanguage(value: unknown): value is Language {
  return languages.some((language) => language === value);
}
