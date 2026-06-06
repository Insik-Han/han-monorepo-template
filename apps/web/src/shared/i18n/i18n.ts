import { i18n } from "@lingui/core";

import { messages as enMessages } from "./locales/en/messages.po";

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

/**
 * Resolve the initial locale: an explicit user choice from `localStorage`
 * wins, otherwise the closest match of the browser languages, falling back
 * to English. Safe to call during the SPA-shell prerender (no `window`) and
 * under Node >= 26, whose experimental `localStorage` global shadows jsdom's
 * in tests and is `undefined` without `--localstorage-file`.
 */
export function detectLocale(): AppLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const stored = window.localStorage?.getItem(STORAGE_KEY);
  if (stored && isAppLocale(stored)) return stored;

  for (const language of window.navigator.languages) {
    const base = language.split("-")[0];
    if (base && isAppLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** Persist an explicit locale choice so it survives reloads. */
export function persistLocale(locale: AppLocale) {
  window.localStorage?.setItem(STORAGE_KEY, locale);
}

/** Load a catalog on demand and make it the active locale. */
export async function dynamicActivate(locale: AppLocale) {
  const { messages } = await import(`./locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

/**
 * Activate English synchronously so the very first render (including the
 * SPA-shell prerender, where I18nProvider would otherwise render nothing)
 * has messages, then switch to the detected locale in the background.
 */
export function initI18n() {
  i18n.load(DEFAULT_LOCALE, enMessages);
  i18n.activate(DEFAULT_LOCALE);

  if (typeof window === "undefined") return;
  const locale = detectLocale();
  if (locale !== DEFAULT_LOCALE) void dynamicActivate(locale);
}
