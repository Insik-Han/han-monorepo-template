import { expect, test } from "@playwright/test";

// Exercises the auth UI without requiring the API server: client-side
// validation runs before any network call.
test("login page switches between sign-up and sign-in", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

  await page.getByRole("button", { name: "Already have an account? Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
});

test("sign-in form validates input client-side", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Already have an account? Sign In" }).click();

  // The email must satisfy the browser's native `type="email"` check so the
  // submit reaches the zod validators; the short password then fails there.
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("short");
  // Scoped to the form — the page header renders its own "Sign In" button.
  await page.locator("form").getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
});
