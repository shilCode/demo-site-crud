import { test, expect } from "@playwright/test";

const BASE = process.env.API_URL || "http://localhost:4000";
const API_URL = `${BASE}/api/contacts`;

test.describe("Contacts API", () => {
  let createdId;

  test("POST /api/contacts — create a contact", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: {
        firstName: "API",
        lastName: "Test",
        email: `api-test-${Date.now()}@example.com`,
        phone: "555-0000",
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.firstName).toBe("API");
    createdId = body.id;
  });

  test("GET /api/contacts — list contacts", async ({ request }) => {
    const response = await request.get(API_URL);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body).toHaveProperty("total");
    expect(body).toHaveProperty("page");
    expect(body).toHaveProperty("totalPages");
  });

  test("POST /api/contacts — reject missing fields", async ({ request }) => {
    const response = await request.post(API_URL, {
      data: { firstName: "Only" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("required");
  });

  test("POST /api/contacts — reject duplicate email", async ({ request }) => {
    const email = `dup-${Date.now()}@example.com`;

    await request.post(API_URL, {
      data: { firstName: "First", lastName: "Dup", email },
    });

    const response = await request.post(API_URL, {
      data: { firstName: "Second", lastName: "Dup", email },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toContain("already exists");
  });

  test("PUT /api/contacts/:id — update a contact", async ({ request }) => {
    // Create first
    const createRes = await request.post(API_URL, {
      data: {
        firstName: "Update",
        lastName: "Me",
        email: `update-${Date.now()}@example.com`,
      },
    });
    const { id } = await createRes.json();

    // Update
    const response = await request.put(`${API_URL}/${id}`, {
      data: {
        firstName: "Updated",
        lastName: "Done",
        email: `updated-${Date.now()}@example.com`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.firstName).toBe("Updated");
  });

  test("DELETE /api/contacts/:id — delete a contact", async ({ request }) => {
    // Create first
    const createRes = await request.post(API_URL, {
      data: {
        firstName: "Delete",
        lastName: "Me",
        email: `delete-${Date.now()}@example.com`,
      },
    });
    const { id } = await createRes.json();

    // Delete
    const response = await request.delete(`${API_URL}/${id}`);
    expect(response.status()).toBe(204);

    // Verify gone
    const getRes = await request.get(`${API_URL}/${id}`);
    expect(getRes.status()).toBe(404);
  });

  test("GET /api/contacts?search= — search contacts", async ({ request }) => {
    const unique = `Unique${Date.now()}`;
    await request.post(API_URL, {
      data: {
        firstName: unique,
        lastName: "Searchable",
        email: `${unique.toLowerCase()}@example.com`,
      },
    });

    const response = await request.get(`${API_URL}?search=${unique}`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].firstName).toBe(unique);
  });

  test("GET /api/contacts/:id — 404 for non-existent", async ({ request }) => {
    const response = await request.get(`${API_URL}/999999`);
    expect(response.status()).toBe(404);
  });
});
