"use client";

// TODO: Wire these form controls to your account/workspace store. The controls
// are currently uncontrolled and don't persist changes.

import type { MessageDescriptor } from "@lingui/core";
import type { ReactNode } from "react";

import {
  Button,
  Checkbox,
  Input,
  Label,
  ListBox,
  Select,
  Separator,
  TextArea,
  TextField,
} from "@heroui/react";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";

import { LocaleSelect } from "@/features/locale";

const PROVINCES: readonly { id: string; label: MessageDescriptor }[] = [
  { id: "on", label: msg`Ontario` },
  { id: "qc", label: msg`Quebec` },
  { id: "bc", label: msg`British Columbia` },
  { id: "ab", label: msg`Alberta` },
] as const;

const CURRENCIES: readonly { id: string; label: MessageDescriptor }[] = [
  { id: "cad", label: msg`CAD - Canadian Dollar` },
  { id: "usd", label: msg`USD - US Dollar` },
  { id: "eur", label: msg`EUR - Euro` },
  { id: "gbp", label: msg`GBP - British Pound` },
  { id: "mxn", label: msg`MXN - Mexican Peso` },
] as const;

export function SettingsPage() {
  const { t } = useLingui();

  return (
    <form className="mx-auto flex max-w-5xl flex-col gap-4 px-5 pb-10 pt-4">
      <p className="text-muted text-sm">
        <Trans>Manage your organization profile and preferences.</Trans>
      </p>

      <Separator />

      <SettingsRow
        description={t`This will be displayed on your public profile.`}
        label={t`Organization Name`}
      >
        <TextField name="org-name">
          <Label className="sr-only">
            <Trans>Organization Name</Trans>
          </Label>
          <Input fullWidth placeholder={t`Your organization`} />
        </TextField>
      </SettingsRow>

      <Separator />

      <SettingsRow
        description={t`This will be displayed on your public profile. Maximum 240 characters.`}
        label={t`Organization Bio`}
      >
        <TextField name="org-bio">
          <Label className="sr-only">
            <Trans>Organization Bio</Trans>
          </Label>
          <TextArea
            fullWidth
            className="min-h-24 resize-y"
            maxLength={240}
            placeholder={t`Tell customers about your organization`}
          />
        </TextField>
      </SettingsRow>

      <Separator />

      <SettingsRow
        description={t`This is how customers can contact you for support.`}
        label={t`Organization Email`}
      >
        <TextField name="org-email">
          <Label className="sr-only">
            <Trans>Organization Email</Trans>
          </Label>
          <Input fullWidth placeholder="info@example.com" type="email" />
        </TextField>
        <Checkbox id="org-email-public" name="org-email-public">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label htmlFor="org-email-public">
              <Trans>Show email on public profile</Trans>
            </Label>
          </Checkbox.Content>
        </Checkbox>
      </SettingsRow>

      <Separator />

      <SettingsRow
        description={t`This is where your organization is registered.`}
        label={t`Address`}
      >
        <TextField name="address-street">
          <Label className="sr-only">
            <Trans>Street address</Trans>
          </Label>
          <Input fullWidth placeholder={t`Street address`} />
        </TextField>
        <TextField name="address-city">
          <Label className="sr-only">
            <Trans>City</Trans>
          </Label>
          <Input fullWidth placeholder={t`City`} />
        </TextField>
        <div className="grid grid-cols-[1fr_160px] gap-3">
          <Select name="address-province" placeholder={t`Province / State`}>
            <Label className="sr-only">
              <Trans>Province / State</Trans>
            </Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {PROVINCES.map((p) => (
                  <ListBox.Item key={p.id} id={p.id} textValue={t(p.label)}>
                    {t(p.label)}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <TextField name="address-postal">
            <Label className="sr-only">
              <Trans>Postal / ZIP</Trans>
            </Label>
            <Input fullWidth placeholder={t`Postal code`} />
          </TextField>
        </div>
      </SettingsRow>

      <Separator />

      <SettingsRow
        description={t`The currency that your organization will be collecting.`}
        label={t`Currency`}
      >
        <Select name="currency" placeholder={t`Select currency`}>
          <Label className="sr-only">
            <Trans>Currency</Trans>
          </Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {CURRENCIES.map((c) => (
                <ListBox.Item key={c.id} id={c.id} textValue={t(c.label)}>
                  {t(c.label)}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </SettingsRow>

      <Separator />

      <SettingsRow description={t`The language used across the app.`} label={t`Language`}>
        <LocaleSelect />
      </SettingsRow>

      <Separator />

      <footer className="flex items-center justify-end gap-2 pt-2">
        <Button type="reset" variant="ghost">
          <Trans comment="Button that resets the settings form to its previous values">Reset</Trans>
        </Button>
        <Button type="submit">
          <Trans>Save changes</Trans>
        </Button>
      </footer>
    </form>
  );
}

interface SettingsRowProps {
  description: string;
  label: string;
  children: ReactNode;
}

function SettingsRow({ children, description, label }: SettingsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-10">
      <div className="flex flex-col gap-1">
        <span className="text-foreground text-sm font-medium">{label}</span>
        <p className="text-muted text-xs leading-snug">{description}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
