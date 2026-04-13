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
- Playwright browsers installed via `npx playwright install`.

---

## Step 7 — Test Bug Fixes (Parallel Safety)

- Tests were failing because 3 browser projects shared one DB with hardcoded emails → 409 duplicate email errors.
- Fixed by generating unique emails/names per test via `uid()` helper (`Date.now()` + random suffix).
- Fixed `not.toBeVisible()` on delete test — the contact name still existed in the closing confirm dialog. Changed to assert `toHaveCount(0)` on the table row instead.
- Fixed race condition in `ContactList.jsx` — initial `loadContacts()` response could overwrite a search response. Added a `useRef` request counter to discard stale responses.

**Files changed:** `e2e/tests/contacts.spec.js`, `client/src/components/ContactList.jsx`

---

## Step 8 — Visual Regression Tests

- Added `e2e/tests/visual.spec.js` with 5 screenshot comparison tests:
  1. Contact list page
  2. Empty state (no search results)
  3. New contact form
  4. Form validation errors
  5. Confirm delete dialog
- Uses `toHaveScreenshot()` — baselines stored in `tests/visual.spec.js-snapshots/`.
- Runs across all 3 browsers (15 visual tests total).

**Files:** `e2e/tests/visual.spec.js`

---

## Step 9 — Accessibility Tests (`@axe-core/playwright`)

- Installed `@axe-core/playwright` in `e2e/`.
- Added `e2e/tests/accessibility.spec.js` with 4 axe-core scans:
  1. Contact list page
  2. New contact form
  3. Form with validation errors
  4. Confirm delete dialog
- Fixed violations found by axe:
  - Added `<h1>` heading to Contact list page (`page-has-heading-one`).
  - Changed error text from `text-red-500` → `text-red-600` for WCAG AA contrast ratio.
  - Added `aria-describedby` on inputs linking to error messages.
  - Added `role="alert"` on error messages.
  - Added `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` on confirm dialog.

**Files:** `e2e/tests/accessibility.spec.js`, `client/src/components/ContactList.jsx`, `client/src/components/ContactForm.jsx`, `client/src/components/ConfirmDialog.jsx`

---

## Step 10 — Pagination

- Server returns paginated responses: `{ data, total, page, totalPages }`.
- `GET /api/contacts` now accepts `?page=1&limit=10` query params (default 10 per page, max 100).
- Client `fetchContacts()` updated to pass page number.
- `ContactList.jsx` shows Previous/Next pagination controls when `totalPages > 1`.
- All pagination elements have `data-testid` attributes (`pagination`, `pagination-prev`, `pagination-next`, `pagination-info`).
- API tests updated to handle new response shape (`body.data` array instead of flat array).

**Files:** `server/src/index.js`, `client/src/api/contacts.js`, `client/src/components/ContactList.jsx`, `e2e/tests/api.spec.js`

---

## Step 11 — Docker

- **Dockerfile** — multi-stage build:
  1. `server` stage: installs deps, generates Prisma client.
  2. `client-build` stage: installs deps, runs `vite build`.
  3. `production` stage: copies server + built client into a single image, runs migrations + starts server.
- **docker-compose.yml** — single `app` service on port 4000, persistent volume for SQLite DB.
- **.dockerignore** — excludes `node_modules`, `dist`, `e2e`, `.git`.
- Server updated to serve static files from `public/` directory and handle SPA routing with `*` catch-all.
- CORS origin now configurable via `CORS_ORIGIN` env var.

**Files:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `server/src/index.js`

---

## Step 12 — GitHub Actions CI Pipeline

- `.github/workflows/ci.yml` with two jobs:
  - **test**: installs deps, runs Prisma migrate + seed, builds client, installs Playwright browsers, runs full E2E suite. Uploads Playwright report and test results as artifacts.
  - **docker**: builds Docker image and smoke-tests it with a `curl` health check. Only runs on `main` after tests pass.

**Files:** `.github/workflows/ci.yml`

---

## Current Test Count: 75 tests

| Suite | Tests | × Browsers | Total |
|---|---|---|---|
| UI CRUD (`contacts.spec.js`) | 10 | 3 | 30 |
| API (`api.spec.js`) | 8 | 3 | 24 |
| Accessibility (`accessibility.spec.js`) | 4 | 3 | 12 |
| Visual Regression (`visual.spec.js`) | 5 | 3 | 15 |
| **Total** | **27** | | **75** |

---

## What's NOT Yet Done (Future Steps)

- [ ] Add pagination E2E tests (seed >10 contacts, test Next/Previous navigation)
- [ ] Test Docker build in CI with Playwright (containerized E2E)
- [ ] Add API rate limiting
- [ ] Add authentication/authorization layer
