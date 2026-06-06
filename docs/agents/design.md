# Design System

This project uses the HeroUI default theme across web and native. Product code should use semantic tokens and component variants, not raw color or spacing values.

## When To Read This

Read this document before changing UI structure, visual hierarchy, themes, colors, typography, spacing, component variants, or cross-platform styling.

Then read the platform-specific styling guide:

- Web: `docs/agents/styling-web.md`
- Native: `docs/agents/styling-native.md`

## Source Files

- Web theme entry: `apps/web/src/index.css`
- Native theme entry: `apps/native/global.css`
- Native theme state: `apps/native/contexts/app-theme-context.tsx`

## Principles

- Prefer HeroUI components before custom UI.
- Use semantic variants and tokens: `primary`, `secondary`, `tertiary`, `outline`, `ghost`, `danger`, `danger-soft`, `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-border`.
- Do not hard-code raw hex, oklch, shadow, radius, or spacing values into components unless there is no tokenized equivalent.
- Keep the same token names across light and dark modes. Do not branch component code to manually choose colors.
- Reserve `accent` for primary emphasis and real selection. Use `success`, `warning`, and `danger` only for their semantic meanings.
- Use spacing, type hierarchy, surface level, and content order before adding borders, shadows, or decorative icons.
- Avoid nested heavy surfaces. A card inside a card should be questioned unless it is a repeated item or a clear sub-surface.
- Keep headings short and scannable. Avoid ALL CAPS labels unless they come from an external brand or data source.
- Use tabular numbers for counters, stats, timings, and aligned numeric displays.
- Icon-only actions need accessible labels or tooltips on web, and accessible labels or clear native accessibility props on native.

## Theme Rules

- Base spacing unit is `4px`. Prefer the Tailwind/HeroUI spacing rhythm (`gap-3`, `gap-4`, `p-4`, `p-6`, etc.).
- Prefer component defaults and existing radius utilities over ad hoc values.
- Surface shadows are intentionally subtle. Do not stack custom shadows on HeroUI Card, Surface, Sheet, Modal, Popover, or Dropdown components.

## Skill Usage

Use these local skills when implementing or reviewing UI:

- `.agents/skills/heroui-react/SKILL.md` for web UI.
- `.agents/skills/heroui-native/SKILL.md` and `.agents/skills/uniwind/SKILL.md` for native UI.
- `.agents/skills/web-design-guidelines/SKILL.md` when explicitly reviewing web UI quality or accessibility.

When HeroUI component APIs are involved, fetch current component docs through the HeroUI MCP tools before implementing. Do not infer component names or compound anatomy from memory.
