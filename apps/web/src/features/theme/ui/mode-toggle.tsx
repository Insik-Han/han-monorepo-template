import { Button, Dropdown, Label, useTheme } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { t } = useLingui();
  // HeroUI's useTheme applies the resolved class + `data-theme` to <html> and
  // persists the selection in localStorage — instances share that state, so
  // calling it here and at the route root is safe.
  const { setTheme, theme } = useTheme("system");

  return (
    <Dropdown>
      <Button isIconOnly aria-label={t`Toggle theme`} size="sm" variant="outline">
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </Button>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu selectedKeys={[theme]} selectionMode="single">
          <Dropdown.Item id="light" textValue={t`Light`} onAction={() => setTheme("light")}>
            <Label>
              <Trans comment="Light color theme option in the theme toggle menu">Light</Trans>
            </Label>
          </Dropdown.Item>
          <Dropdown.Item id="dark" textValue={t`Dark`} onAction={() => setTheme("dark")}>
            <Label>
              <Trans comment="Dark color theme option in the theme toggle menu">Dark</Trans>
            </Label>
          </Dropdown.Item>
          <Dropdown.Item id="system" textValue={t`System`} onAction={() => setTheme("system")}>
            <Label>
              <Trans comment="System color theme option in the theme toggle menu">System</Trans>
            </Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
