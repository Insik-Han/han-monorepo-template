"use client";

import { useLingui } from "@lingui/react/macro";
import { Label, ListBox, Select } from "@heroui/react";

import { type AppLocale, LOCALES, dynamicActivate, persistLocale } from "@/shared/i18n";

/**
 * Language picker backed by Lingui: switches the active catalog and persists
 * the choice so it survives reloads.
 */
export function LocaleSelect() {
  const { t, i18n } = useLingui();

  const handleChange = (key: React.Key | null) => {
    if (key === null) return;
    const locale = key as AppLocale;
    persistLocale(locale);
    void dynamicActivate(locale);
  };

  return (
    <Select
      aria-label={t({
        comment: "Accessible label for the language picker in the settings page",
        message: "Language",
      })}
      name="locale"
      selectedKey={i18n.locale}
      onSelectionChange={handleChange}
    >
      <Label className="sr-only">
        {t({
          comment: "Accessible label for the language picker in the settings page",
          message: "Language",
        })}
      </Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {LOCALES.map((locale) => (
            <ListBox.Item key={locale.value} id={locale.value} textValue={locale.label}>
              {locale.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
