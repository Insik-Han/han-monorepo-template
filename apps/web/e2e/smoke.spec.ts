import { expect, test } from "@playwright/test";

test("home page renders the app shell", async ({ page }) => {
  await page.goto("/");

  // The API status section renders regardless of whether the server app is up.
  await expect(page.getByRole("heading", { name: "API Status" })).toBeVisible();
});
