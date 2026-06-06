import { screen } from "@testing-library/react-native";

import { renderWithProviders } from "@/shared/test/render";

import TabTwo from "./two";

describe("TabTwo", () => {
  it("renders the card title", async () => {
    await renderWithProviders(<TabTwo />);

    expect(screen.getByText("Tab Two")).toBeOnTheScreen();
  });
});
