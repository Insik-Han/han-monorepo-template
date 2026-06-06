# Web Styling

Web lives in `apps/web` and uses React, TanStack Router, Tailwind CSS v4, and HeroUI v3.

## Stack

Read `apps/web/package.json` before changing dependencies or styling setup.

Current styling dependencies include:

- `@heroui/react`
- `@heroui/styles`
- `@tailwindcss/vite`
- `tailwindcss`
- `lucide-react`

## Entry Points

- Global CSS: `apps/web/src/index.css`
- CSS import site: `apps/web/src/routes/__root.tsx`
- App shell: `apps/web/src/routes/__root.tsx`

`apps/web/src/index.css` must keep this import order:

```css
@import "tailwindcss";
@import "@heroui/styles";
```

Do not add a HeroUI provider for v3. HeroUI v3 components are used directly.

## Component Rules

- Import base components from `@heroui/react`.
- Use compound component anatomy, such as `Card.Header`, `Card.Content`, `Sheet.Content`, and similar documented subcomponents.
- Use `onPress` for HeroUI interactive components when the component supports it.
- Use `lucide-react` icons for web icon buttons unless a HeroUI component provides its own icon affordance.
- Prefer HeroUI field, overlay, dropdown, modal, sheet, tab, segment, card, and button components over custom markup.
- Do not use HeroUI v2 patterns such as `HeroUIProvider`, flattened `CardHeader` imports, numbered color tokens, or `color="danger" variant="soft"` combinations.

## Token Usage

- Backgrounds: `bg-background`, `bg-surface`, `bg-surface-secondary`, `bg-overlay`
- Text: `text-foreground`, `text-muted`
- Borders and separators: `border-border`, `border-separator`
- Actions: `Button variant="primary"` for the main action, `secondary`, `tertiary`, `outline`, or `ghost` for alternatives, `danger` or `danger-soft` for destructive actions.
- Status: use `success`, `warning`, and `danger` only for true status meaning.

Avoid raw Tailwind palette classes such as `text-indigo-600`, `bg-green-500`, or `text-red-500` in product UI. Prefer semantic theme tokens or HeroUI variants so light and dark modes stay coherent.

## Layout Rules

- Use full-height app surfaces with `h-svh` where the shell needs viewport height.
- Constrain page content width for readability on desktop.
- Prefer `gap-*` and parent-owned padding over child margins.
- Avoid card-in-card visual depth unless the inner card is a repeated item or clearly separate object.
- Use `Separator` rather than raw border dividers when a semantic divider is needed.
- Use tooltips and accessible labels for icon-only controls.

## Validation

For web UI changes, run the relevant Vite+ checks from `docs/agents/vite-plus.md`.

If the change is visual, inspect it in a browser and check at least a narrow mobile viewport and a desktop viewport. Confirm text does not overflow buttons, cards, nav items, forms, or overlays.
