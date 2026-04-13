const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// List contacts (with optional search and pagination)
app.get("/api/contacts", async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const take = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.contact.count({ where }),
  ]);

  res.json({
    data: contacts,
    total,
    page: Math.max(parseInt(page, 10) || 1, 1),
    totalPages: Math.ceil(total / take),
  });
});

// Get single contact
app.get("/api/contacts/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  res.json(contact);
});

// Create contact
app.post("/api/contacts", async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "firstName, lastName, and email are required" });
  }

  try {
    const contact = await prisma.contact.create({
      data: { firstName, lastName, email, phone: phone || null },
    });
    res.status(201).json(contact);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A contact with this email already exists" });
    }
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// Update contact
app.put("/api/contacts/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { firstName, lastName, email, phone } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "firstName, lastName, and email are required" });
  }

  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: { firstName, lastName, email, phone: phone || null },
    });
    res.json(contact);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Contact not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A contact with this email already exists" });
    }
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// Delete contact
app.delete("/api/contacts/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    await prisma.contact.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// Serve static client files in production
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
