import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("contact list page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("contacts-table").or(page.getByTestId("empty-state"))).toBeVisible();
    await expect(page).toHaveScreenshot("contact-list.png", { maxDiffPixelRatio: 0.05 });
  });

  test("empty state", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("contacts-table").or(page.getByTestId("empty-state"))).toBeVisible();
    await page.getByTestId("search-input").fill("zzzznonexistent");
    await page.getByTestId("search-button").click();
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page).toHaveScreenshot("empty-state.png", { fullPage: true });
  });

  test("new contact form", async ({ page }) => {
    await page.goto("/contacts/new");
    await expect(page.getByTestId("contact-form-page")).toBeVisible();
    await expect(page).toHaveScreenshot("new-contact-form.png", { fullPage: true });
  });

  test("form validation errors", async ({ page }) => {
    await page.goto("/contacts/new");
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("error-firstName")).toBeVisible();
    await expect(page).toHaveScreenshot("form-validation-errors.png", { fullPage: true });
  });

  test("confirm delete dialog", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("contacts-table")).toBeVisible();
    // Click delete on the first contact row
    const firstRow = page.locator("tbody tr").first();
    await firstRow.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await expect(page).toHaveScreenshot("confirm-delete-dialog.png", { maxDiffPixelRatio: 0.05 });
  });
});
