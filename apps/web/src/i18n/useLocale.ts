import { useSyncExternalStore } from "react";
import {
  getLocaleState,
  type LocaleState,
  subscribeLocale,
  switchLanguage,
} from "./i18n";

export interface UseLocale extends LocaleState {
  switchLanguage: typeof switchLanguage;
}

// The active language and its antd locale, updated after each switch.
export function useLocale(): UseLocale {
  const state = useSyncExternalStore(subscribeLocale, getLocaleState);
  return { ...state, switchLanguage };
}
