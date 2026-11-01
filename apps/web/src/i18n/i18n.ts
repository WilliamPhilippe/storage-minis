import type { Locale } from "antd/es/locale";
// antd already bundles en_US as its default locale, so it loads statically.
// The documented `antd/locale/*` paths are CommonJS shims; `antd/es` is ESM.
import antdEnUS from "antd/es/locale/en_US";
import dayjs from "dayjs";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export const languages = ["en-US", "pt-BR"] as const;
export type Language = (typeof languages)[number];
export type Namespace = "common" | "app" | "login" | "catalog";

// Each language's name in its own language, the same in every catalog.
export const languageNames: Record<Language, string> = {
  "en-US": "English",
  "pt-BR": "Português",
};

// pt-BR catalogs are typed against en-US: every string widens to `string`, and
// every en-US `_other` plural key needs a `_many` key, because pt-BR's plural
// rules add a `many` category (exact millions) and i18next shows the raw key
// when it is missing. pt-BR's `one` form also covers 0.
export type CatalogShape<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : CatalogShape<T[K]>;
} & {
  readonly [
    K in keyof T as K extends `${infer Base}_other` ? `${Base}_many` : never
  ]: string;
};

type Bundle = { default: object };

const bundles: Record<Language, Record<Namespace, () => Promise<Bundle>>> = {
  "en-US": {
    common: () => import("./en-US/common"),
    app: () => import("./en-US/app"),
    login: () => import("./en-US/login"),
    catalog: () => import("./en-US/catalog"),
  },
  "pt-BR": {
    common: () => import("./pt-BR/common"),
    app: () => import("./pt-BR/app"),
    login: () => import("./pt-BR/login"),
    catalog: () => import("./pt-BR/catalog"),
  },
};

const antdLocales: Record<Language, () => Promise<Locale>> = {
  "en-US": () => Promise.resolve(antdEnUS),
  "pt-BR": () =>
    import("antd/es/locale/pt_BR").then((module) => module.default),
};

// `dayjs/locale/pt-br` registers on the dayjs instance antd uses; its
// `dayjs/esm/...` copy registers on a different instance.
const dayjsLocales: Record<Language, () => Promise<string>> = {
  "en-US": () => Promise.resolve("en"),
  "pt-BR": () => import("dayjs/locale/pt-br").then(() => "pt-br"),
};

const storageKey = "storage-minis.language";

export interface LocaleState {
  language: Language;
  antdLocale: Locale;
}

let localeState: LocaleState = { language: "en-US", antdLocale: antdEnUS };
const listeners = new Set<() => void>();
// Namespaces loaded for the active language; a switch loads the same set.
const loadedNamespaces = new Set<Namespace>();
let latestSwitch = 0;

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLocaleState(): LocaleState {
  return localeState;
}

export function isLanguage(value: unknown): value is Language {
  return languages.some((language) => language === value);
}

// The saved choice, then the browser's languages, then en-US.
export function detectLanguage(): Language {
  const saved = readSavedLanguage();
  if (saved) {
    return saved;
  }
  for (const tag of navigator.languages) {
    const primary = tag.toLowerCase().split("-")[0];
    if (primary === "pt") {
      return "pt-BR";
    }
    if (primary === "en") {
      return "en-US";
    }
  }
  return "en-US";
}

interface LoadedLanguage {
  language: Language;
  resources: [Namespace, object][];
  antdLocale: Locale;
  dayjsLocale: string;
}

async function loadLanguage(
  language: Language,
  namespaces: Namespace[],
): Promise<LoadedLanguage> {
  const [resources, antdLocale, dayjsLocale] = await Promise.all([
    Promise.all(
      namespaces.map(async (namespace): Promise<[Namespace, object]> => {
        const bundle = await bundles[language][namespace]();
        return [namespace, bundle.default];
      }),
    ),
    antdLocales[language](),
    dayjsLocales[language](),
  ]);
  return { language, resources, antdLocale, dayjsLocale };
}

async function applyLanguage(loaded: LoadedLanguage): Promise<void> {
  for (const [namespace, resource] of loaded.resources) {
    i18next.addResourceBundle(loaded.language, namespace, resource, true, true);
  }
  await i18next.changeLanguage(loaded.language);
  dayjs.locale(loaded.dayjsLocale);
  localeState = { language: loaded.language, antdLocale: loaded.antdLocale };
  document.documentElement.lang = loaded.language;
  for (const listener of listeners) {
    listener();
  }
}

// Boot: load the language's `common` strings and its antd and dayjs locales
// before the first render.
export async function initI18n(language: Language): Promise<void> {
  const loaded = await loadLanguage(language, ["common"]);
  await i18next.use(initReactI18next).init({
    lng: language,
    supportedLngs: [...languages],
    fallbackLng: false,
    resources: {},
    ns: ["common"],
    defaultNS: "common",
    // React escapes rendered strings.
    interpolation: { escapeValue: false },
    // Bundles always load before rendering, and with no backend i18next
    // never suspends.
    react: { useSuspense: false },
  });
  loadedNamespaces.add("common");
  await applyLanguage(loaded);
}

// Route loaders call this for their area's strings.
export async function ensureNamespace(namespace: Namespace): Promise<void> {
  loadedNamespaces.add(namespace);
  // Loops in case the language changes while the bundle loads.
  for (;;) {
    const { language } = localeState;
    if (i18next.hasResourceBundle(language, namespace)) {
      return;
    }
    const bundle = await bundles[language][namespace]();
    i18next.addResourceBundle(language, namespace, bundle.default, true, true);
  }
}

// Loads the new language's already loaded namespaces and its antd and dayjs
// locales together, then switches. If loading fails, the current language
// stays and the promise rejects. When switches overlap, the last one
// requested wins.
export async function switchLanguage(language: Language): Promise<void> {
  const switchId = ++latestSwitch;
  let loaded: LoadedLanguage;
  try {
    loaded = await loadLanguage(language, [...loadedNamespaces]);
  } catch (error) {
    if (switchId !== latestSwitch) {
      return;
    }
    throw error;
  }
  if (switchId !== latestSwitch) {
    return;
  }
  await applyLanguage(loaded);
  saveLanguage(language);
}

// Storage can throw in private browsing.
function readSavedLanguage(): Language | undefined {
  try {
    const saved = localStorage.getItem(storageKey);
    return isLanguage(saved) ? saved : undefined;
  } catch {
    return undefined;
  }
}

function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(storageKey, language);
  } catch {
    // The choice still applies for this visit.
  }
}
