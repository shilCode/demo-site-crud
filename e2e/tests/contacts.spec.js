import { test, expect } from "@playwright/test";

test.describe("Contact Manager — CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the contact list page", async ({ page }) => {
    await expect(page.getByTestId("contact-list-page")).toBeVisible();
    await expect(page.getByTestId("navbar")).toBeVisible();
  });

  test("should show empty state when no contacts match search", async ({ page }) => {
    await page.getByTestId("search-input").fill("zzzznonexistent");
    await page.getByTestId("search-button").click();
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByText("No contacts found.")).toBeVisible();
  });

  test("should create a new contact", async ({ page }) => {
    await page.getByTestId("nav-add-contact").click();
    await expect(page.getByTestId("form-title")).toHaveText("New Contact");

    await page.getByTestId("input-firstName").fill("John");
    await page.getByTestId("input-lastName").fill("Doe");
    await page.getByTestId("input-email").fill("john.doe@example.com");
    await page.getByTestId("input-phone").fill("555-9999");
    await page.getByTestId("submit-button").click();

    // Should redirect to list and show the new contact
    await expect(page.getByTestId("contact-list-page")).toBeVisible();
    await expect(page.getByText("John Doe")).toBeVisible();
  });

  test("should show validation errors on empty form submit", async ({ page }) => {
    await page.getByTestId("nav-add-contact").click();
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("error-firstName")).toHaveText("First name is required");
    await expect(page.getByTestId("error-lastName")).toHaveText("Last name is required");
    await expect(page.getByTestId("error-email")).toHaveText("Email is required");
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.getByTestId("nav-add-contact").click();

    await page.getByTestId("input-firstName").fill("Test");
    await page.getByTestId("input-lastName").fill("User");
    await page.getByTestId("input-email").fill("not-an-email");
    await page.getByTestId("submit-button").click();

    await expect(page.getByTestId("error-email")).toHaveText("Enter a valid email address");
  });

  test("should edit an existing contact", async ({ page }) => {
    // First create a contact
    await page.getByTestId("nav-add-contact").click();
    await page.getByTestId("input-firstName").fill("EditMe");
    await page.getByTestId("input-lastName").fill("Test");
    await page.getByTestId("input-email").fill("editme@example.com");
    await page.getByTestId("submit-button").click();
    await expect(page.getByTestId("contact-list-page")).toBeVisible();

    // Find and click edit on the newly created contact
    const row = page.getByText("EditMe Test").locator("..");
    await row.getByText("Edit").click();

    // Verify we're on the edit page
    await expect(page.getByTestId("form-title")).toHaveText("Edit Contact");
    await expect(page.getByTestId("input-firstName")).toHaveValue("EditMe");

    // Update the name
    await page.getByTestId("input-firstName").clear();
    await page.getByTestId("input-firstName").fill("Updated");
    await page.getByTestId("submit-button").click();

    // Verify the update
    await expect(page.getByTestId("contact-list-page")).toBeVisible();
    await expect(page.getByText("Updated Test")).toBeVisible();
  });

  test("should delete a contact with confirmation", async ({ page }) => {
    // Create a contact to delete
    await page.getByTestId("nav-add-contact").click();
    await page.getByTestId("input-firstName").fill("DeleteMe");
    await page.getByTestId("input-lastName").fill("Please");
    await page.getByTestId("input-email").fill("deleteme@example.com");
    await page.getByTestId("submit-button").click();
    await expect(page.getByText("DeleteMe Please")).toBeVisible();

    // Click delete
    const row = page.getByText("DeleteMe Please").locator("..");
    await row.getByText("Delete").click();

    // Confirm dialog should appear
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await expect(page.getByTestId("confirm-dialog-message")).toContainText("DeleteMe Please");

    // Confirm deletion
    await page.getByTestId("confirm-delete-button").click();

    // Contact should be gone
    await expect(page.getByText("DeleteMe Please")).not.toBeVisible();
  });

  test("should cancel delete and keep contact", async ({ page }) => {
    // Create a contact
    await page.getByTestId("nav-add-contact").click();
    await page.getByTestId("input-firstName").fill("KeepMe");
    await page.getByTestId("input-lastName").fill("Safe");
    await page.getByTestId("input-email").fill("keepme@example.com");
    await page.getByTestId("submit-button").click();
    await expect(page.getByText("KeepMe Safe")).toBeVisible();

    // Click delete then cancel
    const row = page.getByText("KeepMe Safe").locator("..");
    await row.getByText("Delete").click();
    await page.getByTestId("confirm-cancel-button").click();

    // Contact should still be there
    await expect(page.getByTestId("confirm-dialog")).not.toBeVisible();
    await expect(page.getByText("KeepMe Safe")).toBeVisible();
  });

  test("should search contacts by name", async ({ page }) => {
    // Create two contacts
    await page.getByTestId("nav-add-contact").click();
    await page.getByTestId("input-firstName").fill("SearchAlpha");
    await page.getByTestId("input-lastName").fill("One");
    await page.getByTestId("input-email").fill("alpha@search.com");
    await page.getByTestId("submit-button").click();

    await page.getByTestId("nav-add-contact").click();
    await page.getByTestId("input-firstName").fill("SearchBeta");
    await page.getByTestId("input-lastName").fill("Two");
    await page.getByTestId("input-email").fill("beta@search.com");
    await page.getByTestId("submit-button").click();

    // Search for "Alpha"
    await page.getByTestId("search-input").fill("Alpha");
    await page.getByTestId("search-button").click();

    await expect(page.getByText("SearchAlpha One")).toBeVisible();
    await expect(page.getByText("SearchBeta Two")).not.toBeVisible();
  });

  test("should navigate back with cancel button", async ({ page }) => {
    await page.getByTestId("nav-add-contact").click();
    await expect(page.getByTestId("contact-form-page")).toBeVisible();

    await page.getByTestId("cancel-button").click();
    await expect(page.getByTestId("contact-list-page")).toBeVisible();
  });
});
