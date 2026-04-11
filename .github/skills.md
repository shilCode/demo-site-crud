# Skills / Build Log

Step-by-step record of what was implemented in this project. Use this file to resume context with an LLM or onboard a contributor.

---

## Step 1 — Project Structure & Root Config

- Created a monorepo-style layout with three folders: `server/`, `client/`, `e2e/`.
- Root `package.json` with `concurrently` to run server + client together via `npm run dev`.
- `.gitignore` covers `node_modules/`, `dist/`, `.env`, `*.db`, Playwright artifacts.

**Files:** `package.json`, `.gitignore`

---

## Step 2 — Express + Prisma Server (`server/`)

- Express.js REST API on port **4000** with CORS enabled for `http://localhost:5173`.
- Prisma ORM with **SQLite** (`prisma/dev.db`) — zero-infrastructure database.
- `Contact` model: `id`, `firstName`, `lastName`, `email` (unique), `phone` (optional), `createdAt`, `updatedAt`.
- Full CRUD endpoints:
  - `GET /api/contacts` — list all (with optional `?search=` query filtering by name/email)
  - `GET /api/contacts/:id` — get single contact
  - `POST /api/contacts` — create (validates required fields, catches duplicate email)
  - `PUT /api/contacts/:id` — update (same validation)
  - `DELETE /api/contacts/:id` — delete
- Proper HTTP status codes: `201` for create, `204` for delete, `400`/`404`/`409` for errors.
- Seed script (`prisma/seed.js`) inserts 5 sample contacts.

**Files:** `server/package.json`, `server/src/index.js`, `server/prisma/schema.prisma`, `server/prisma/seed.js`

---

## Step 3 — React + Vite + Tailwind Client (`client/`)

- React 18 SPA bootstrapped with **Vite**.
- **Tailwind CSS** for styling — utility-first, minimal custom CSS.
- **React Router v7** for client-side routing:
  - `/` → Contact list
  - `/contacts/new` → Create form
  - `/contacts/:id/edit` → Edit form
- Vite dev server proxies `/api` requests to the Express backend.

**Files:** `client/package.json`, `client/index.html`, `client/vite.config.js`, `client/tailwind.config.js`, `client/postcss.config.js`, `client/src/main.jsx`, `client/src/index.css`

---

## Step 4 — React Components

### `App.jsx`
- Top-level layout: navbar with home link + "Add Contact" button, `<Routes>` for pages.

### `api/contacts.js`
- Thin API client module wrapping `fetch` calls for all CRUD operations.
- Throws on non-OK responses with the server's error message.

### `components/ContactList.jsx`
- Fetches and displays contacts in a table.
- Search bar (form submit) filters via API query param.
- Empty state component when no contacts found.
- Loading indicator while fetching.
- Each row has Edit and Delete buttons.
- Delete triggers a confirmation dialog.

### `components/ContactForm.jsx`
- Shared form for create and edit (detects mode from URL param `id`).
- Client-side validation: required fields, email regex.
- Displays server-side errors (e.g. duplicate email).
- Redirects to list on success.

### `components/ConfirmDialog.jsx`
- Modal overlay with title, message, Cancel/Delete buttons.
- Controlled via `open` prop.

### Testability
- **Every interactive element** has a `data-testid` attribute for reliable E2E selectors.
- Pattern: `data-testid="contact-row-{id}"`, `data-testid="input-firstName"`, `data-testid="confirm-delete-button"`, etc.

**Files:** `client/src/App.jsx`, `client/src/api/contacts.js`, `client/src/components/ContactList.jsx`, `client/src/components/ContactForm.jsx`, `client/src/components/ConfirmDialog.jsx`

---

## Step 5 — Playwright E2E Tests (`e2e/`)

- Playwright configured for **3 browsers**: Chromium, Firefox, WebKit.
- `webServer` config auto-starts both the Express server and Vite dev server.
- HTML reporter enabled; traces captured on first retry.
- Screenshots on failure.

### `tests/contacts.spec.js` — UI Tests (9 tests)
1. Display the contact list page
2. Show empty state when search has no matches
3. Create a new contact (full happy path)
4. Validation errors on empty form submit
5. Validation error for invalid email
6. Edit an existing contact
7. Delete a contact with confirmation dialog
8. Cancel delete and keep contact
9. Search contacts by name

### `tests/api.spec.js` — API Tests (8 tests)
1. `POST` — create a contact
2. `GET` — list contacts
3. `POST` — reject missing required fields (400)
4. `POST` — reject duplicate email (409)
5. `PUT` — update a contact
6. `DELETE` — delete a contact + verify 404 after
7. `GET ?search=` — search contacts
8. `GET /:id` — 404 for non-existent contact

**Files:** `e2e/package.json`, `e2e/playwright.config.js`, `e2e/tests/contacts.spec.js`, `e2e/tests/api.spec.js`

---

## Step 6 — Dependencies Installed & DB Initialized

- All three `package.json` files had `npm install` run.
- `npx prisma migrate dev --name init` created the SQLite database and migration.
- `node prisma/seed.js` populated 5 sample contacts.
- Playwright browsers still need to be installed: `npx playwright install`.

---

## What's NOT Yet Done (Future Steps)

- [ ] Install Playwright browsers (`cd e2e && npx playwright install`)
- [ ] Run the full E2E suite to verify all tests pass
- [ ] CI pipeline (GitHub Actions)
- [ ] Visual regression / screenshot comparison tests
- [ ] Accessibility tests (`@axe-core/playwright`)
- [ ] Pagination for large contact lists
- [ ] Production build & deploy config
