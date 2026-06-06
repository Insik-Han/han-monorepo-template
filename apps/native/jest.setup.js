/* eslint-disable no-undef */
// Native-module mocks that every test needs.
jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);
