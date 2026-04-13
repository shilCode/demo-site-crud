import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("contact list page has no a11y violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("contacts-table").or(page.getByTestId("empty-state"))).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("new contact form has no a11y violations", async ({ page }) => {
    await page.goto("/contacts/new");
    await expect(page.getByTestId("contact-form-page")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("form with validation errors has no a11y violations", async ({ page }) => {
    await page.goto("/contacts/new");
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("error-firstName")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("confirm delete dialog has no a11y violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("contacts-table")).toBeVisible();

    const firstRow = page.locator("tbody tr").first();
    await firstRow.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
