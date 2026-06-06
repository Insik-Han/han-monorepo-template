import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import Loader from "./loader";

describe("Loader", () => {
  it("renders a spinner", () => {
    const { container } = render(<Loader />);

    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });
});
