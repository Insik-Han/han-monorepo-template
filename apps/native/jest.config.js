const expoPreset = require("jest-expo/jest-preset");

module.exports = {
  preset: "jest-expo",
  // jest-expo only transforms `.[jt]sx?`; route ESM-only `.mjs`/`.mts` files
  // (e.g. @lingui/*) through the same babel-jest transformer.
  transform: {
    ...expoPreset.transform,
    "\\.m[jt]sx?$": expoPreset.transform["\\.[jt]sx?$"],
  },
  setupFiles: ["./jest.setup.js"],
  // Reanimated 4 detects Jest via JEST_WORKER_ID, but react-native-worklets
  // must resolve its JS (non-`.native`) implementations — its bundled
  // resolver takes care of that.
  resolver: "react-native-worklets/jest/resolver.js",
  // Extend jest-expo's default allowlist with ESM-only packages that Babel
  // must transform (the trailing `/node_modules/<pkg>` segment inside the
  // `.pnpm` store is matched too, so the package names must be listed here).
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@lingui|@messageformat|heroui-native|uniwind|tailwind-variants))",
    "/node_modules/react-native-reanimated/plugin/",
    "/node_modules/@react-native/babel-preset/",
  ],
  testMatch: ["**/*.test.{ts,tsx}"],
};
