import { i18n } from "@lingui/core";
import { getLocales } from "expo-localization";
import * as SecureStore from "expo-secure-store";

import { messages as enMessages } from "./locales/en/messages.po";
import { messages as jaMessages } from "./locales/ja/messages.po";
import { messages as koMessages } from "./locales/ko/messages.po";

/** Locales the app ships catalogs for, with native-language labels for pickers. */
export const LOCALES = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
] as const;

export type AppLocale = (typeof LOCALES)[number]["value"];

const DEFAULT_LOCALE: AppLocale = "en";
const STORAGE_KEY = "locale";

function isAppLocale(value: string): value is AppLocale {
  return LOCALES.some((locale) => locale.value === value);
}

function detectDeviceLocale(): AppLocale {
  for (const { languageCode } of getLocales()) {
    if (languageCode && isAppLocale(languageCode)) return languageCode;
  }
  return DEFAULT_LOCALE;
}

/** Activate an explicit locale choice and persist it across launches. */
export function setLocale(locale: AppLocale) {
  i18n.activate(locale);
  void SecureStore.setItemAsync(STORAGE_KEY, locale);
}

/**
 * Load all catalogs (compiled in-bundle by the Metro transformer) and
 * activate the device locale synchronously, then switch to a previously
 * persisted choice once SecureStore answers.
 */
export function initI18n() {
  i18n.load({ en: enMessages, ja: jaMessages, ko: koMessages });
  i18n.activate(detectDeviceLocale());

  void SecureStore.getItemAsync(STORAGE_KEY).then((stored) => {
    if (stored && isAppLocale(stored) && stored !== i18n.locale) i18n.activate(stored);
  });
}
