const API_BASE = "/api/contacts";

export async function fetchContacts(search = "", page = 1) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", page);
  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

export async function fetchContact(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch contact");
  return res.json();
}

export async function createContact(data) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create contact");
  }
  return res.json();
}

export async function updateContact(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update contact");
  }
  return res.json();
}

export async function deleteContact(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete contact");
}
