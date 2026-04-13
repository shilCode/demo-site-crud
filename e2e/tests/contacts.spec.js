import { test, expect } from "@playwright/test";

// Generate unique suffix per worker to avoid email collisions across parallel browsers
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Helper: create a contact via the UI and wait for redirect back to list */
async function createContactViaUI(page, { firstName, lastName, email, phone }) {
  await page.getByTestId("nav-add-contact").click();
  await expect(page.getByTestId("form-title")).toHaveText("New Contact");
  await page.getByTestId("input-firstName").fill(firstName);
  await page.getByTestId("input-lastName").fill(lastName);
  await page.getByTestId("input-email").fill(email);
  if (phone) await page.getByTestId("input-phone").fill(phone);
  await page.getByTestId("submit-button").click();
  await expect(page.getByTestId("contact-list-page")).toBeVisible();
}

test.describe("Contact Manager — CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the contact list page", async ({ page }) => {
    await expect(page.getByTestId("contact-list-page")).toBeVisible();
    await expect(page.getByTestId("navbar")).toBeVisible();
  });

  test("should show empty state when no contacts match search", async ({ page }) => {
    // Wait for initial data load to complete
    await expect(page.getByTestId("contacts-table").or(page.getByTestId("empty-state"))).toBeVisible();

    await page.getByTestId("search-input").fill("zzzznonexistent");
    await page.getByTestId("search-button").click();
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await expect(page.getByText("No contacts found.")).toBeVisible();
  });

  test("should create a new contact", async ({ page }) => {
    const id = uid();
    const fullName = `John${id} Doe`;
    await page.getByTestId("nav-add-contact").click();
    await expect(page.getByTestId("form-title")).toHaveText("New Contact");

    await page.getByTestId("input-firstName").fill(`John${id}`);
    await page.getByTestId("input-lastName").fill("Doe");
    await page.getByTestId("input-email").fill(`john.doe.${id}@example.com`);
    await page.getByTestId("input-phone").fill("555-9999");
    await page.getByTestId("submit-button").click();

    // Should redirect to list and show the new contact
    await expect(page.getByTestId("contact-list-page")).toBeVisible();
    await expect(page.getByText(fullName)).toBeVisible();
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
    const id = uid();
    const fullName = `EditMe${id}`;

    // First create a contact
    await createContactViaUI(page, {
      firstName: fullName,
      lastName: "Test",
      email: `editme-${id}@example.com`,
    });

    // Find the row containing our contact and click Edit
    const row = page.locator("tr", { hasText: fullName });
    await row.getByRole("button", { name: "Edit" }).click();

    // Verify we're on the edit page
    await expect(page.getByTestId("form-title")).toHaveText("Edit Contact");
    await expect(page.getByTestId("input-firstName")).toHaveValue(fullName);

    // Update the name
    const updatedName = `Updated${id}`;
    await page.getByTestId("input-firstName").clear();
    await page.getByTestId("input-firstName").fill(updatedName);
    await page.getByTestId("submit-button").click();

    // Verify the update
    await expect(page.getByTestId("contact-list-page")).toBeVisible();
    await expect(page.getByText(`${updatedName} Test`)).toBeVisible();
  });

  test("should delete a contact with confirmation", async ({ page }) => {
    const id = uid();
    const fullName = `DeleteMe${id} Please`;

    // Create a contact to delete
    await createContactViaUI(page, {
      firstName: `DeleteMe${id}`,
      lastName: "Please",
      email: `deleteme-${id}@example.com`,
    });
    await expect(page.getByText(fullName)).toBeVisible();

    // Click delete on the row
    const row = page.locator("tr", { hasText: fullName });
    await row.getByRole("button", { name: "Delete" }).click();

    // Confirm dialog should appear
    await expect(page.getByTestId("confirm-dialog")).toBeVisible();
    await expect(page.getByTestId("confirm-dialog-message")).toContainText(`DeleteMe${id}`);

    // Confirm deletion
    await page.getByTestId("confirm-delete-button").click();

    // Wait for dialog to close, then verify contact is gone from the table
    await expect(page.getByTestId("confirm-dialog")).not.toBeVisible();
    await expect(page.locator("tr", { hasText: fullName })).toHaveCount(0);
  });

  test("should cancel delete and keep contact", async ({ page }) => {
    const id = uid();
    const fullName = `KeepMe${id} Safe`;

    // Create a contact
    await createContactViaUI(page, {
      firstName: `KeepMe${id}`,
      lastName: "Safe",
      email: `keepme-${id}@example.com`,
    });
    await expect(page.getByText(fullName)).toBeVisible();

    // Click delete then cancel
    const row = page.locator("tr", { hasText: fullName });
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByTestId("confirm-cancel-button").click();

    // Contact should still be there
    await expect(page.getByTestId("confirm-dialog")).not.toBeVisible();
    await expect(page.getByText(fullName)).toBeVisible();
  });

  test("should search contacts by name", async ({ page }) => {
    const id = uid();

    // Create two contacts with unique names
    await createContactViaUI(page, {
      firstName: `Alpha${id}`,
      lastName: "One",
      email: `alpha-${id}@search.com`,
    });

    await createContactViaUI(page, {
      firstName: `Beta${id}`,
      lastName: "Two",
      email: `beta-${id}@search.com`,
    });

    // Search for "Alpha{id}" — unique enough to match only one
    await page.getByTestId("search-input").fill(`Alpha${id}`);
    await page.getByTestId("search-button").click();

    await expect(page.getByText(`Alpha${id} One`)).toBeVisible();
    await expect(page.getByText(`Beta${id} Two`)).not.toBeVisible();
  });

  test("should navigate back with cancel button", async ({ page }) => {
    await page.getByTestId("nav-add-contact").click();
    await expect(page.getByTestId("contact-form-page")).toBeVisible();

    await page.getByTestId("cancel-button").click();
    await expect(page.getByTestId("contact-list-page")).toBeVisible();
  });
});
