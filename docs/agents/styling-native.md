# Native Styling

Native lives in `apps/native` and uses Expo Router, React Native, Uniwind, and HeroUI Native.

## Stack

Read `apps/native/package.json` before changing dependencies or styling setup.

Current styling dependencies include:

- `heroui-native`
- `uniwind`
- `tailwindcss`
- `tailwind-variants`
- `tailwind-merge`
- `react-native-reanimated`
- `react-native-gesture-handler`
- `react-native-safe-area-context`
- `@expo/vector-icons`

This project uses **Uniwind**, not NativeWind. Do not add NativeWind, `react-native-css`, NativeWind Babel presets, or NativeWind Metro wrappers.

## Entry Points

- Global CSS: `apps/native/global.css`
- Root layout: `apps/native/app/_layout.tsx`
- Metro config: `apps/native/metro.config.js`
- Theme context: `apps/native/contexts/app-theme-context.tsx`

`apps/native/global.css` must keep Tailwind, Uniwind, and HeroUI Native imports before project theme overrides:

```css
@import "tailwindcss";
@import "uniwind";
@import "heroui-native/styles";

@source './node_modules/heroui-native/lib';
```

`apps/native/metro.config.js` must keep `withUniwindConfig(...)` as the outer styling wrapper and point `cssEntryFile` at `./global.css`.

## Provider Rules

The app root should keep this provider shape:

- `QueryClientProvider`
- `GestureHandlerRootView`
- `KeyboardProvider`
- `AppThemeProvider`
- `HeroUINativeProvider`
- Expo Router stack/content

Do not remove `GestureHandlerRootView` or `HeroUINativeProvider`; HeroUI Native components depend on them.

## Component Rules

- Import base components from `heroui-native`.
- Use `View`, `Text`, `Pressable`, `ScrollView`, `FlatList`, and other React Native primitives, never web tags such as `div`, `span`, or `button`.
- Use `onPress`, never `onClick`.
- Use HeroUI Native compound anatomy from docs. Native anatomy can differ from web; for example, Card uses native-specific subcomponents.
- Use `className` with complete static Uniwind class strings or explicit maps. Do not construct class names dynamically with template fragments that Tailwind cannot scan.
- Use `withUniwind` only for third-party components that need className support, such as icon components. Do not wrap React Native primitives or Reanimated primitives with `withUniwind`.

## Token Usage

- Backgrounds: `bg-background`, `bg-surface`, `bg-surface-secondary`, `bg-overlay`
- Text: `text-foreground`, `text-muted`
- Borders and separators: `border-border`, `border-separator`
- Actions: HeroUI Native `Button` variants for primary, secondary, tertiary, outline, ghost, danger, and danger-soft actions.
- Status: use `success`, `warning`, and `danger` only for true status meaning.

Avoid raw palette classes such as `bg-green-500`, `text-red-500`, or hard-coded color styles in product UI. Prefer semantic tokens and `useThemeColor(...)` when a native API needs a concrete color value.

## Native Layout Rules

- Account for safe areas through Expo Router headers, tabs, `react-native-safe-area-context`, or existing container components.
- Prefer flexbox, `gap-*`, and parent-owned padding.
- Use `ScrollView` or list components for content that can exceed screen height.
- Use `contentContainerClassName` or content container styles for scroll padding when supported.
- Keep touch targets comfortable. Icon-only `Pressable` and Button controls need clear accessible labels.
- Use Reanimated for meaningful state transitions, but avoid animation that makes high-frequency controls feel slow.
- Add iOS haptics only when the interaction benefits from tactile feedback and guard platform-specific behavior.

## Validation

For native UI changes, start with Expo Go when possible. Use custom native builds only when the feature requires native code or unsupported Expo Go modules.

When changing layout or styling, verify at least a small phone size and a larger device size. Check text wrapping, safe area spacing, keyboard behavior for forms, and touch target sizing.
