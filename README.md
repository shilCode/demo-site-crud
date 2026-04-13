# Contact Manager — CRUD Demo Site

A full-stack Contact Manager app built to demonstrate E2E testing skills with Playwright.

**Stack:** React (Vite) · Express · Prisma · SQLite · Tailwind CSS · Playwright · Docker

## Project Structure

```
├── client/          React SPA (Vite + Tailwind)
├── server/          Express REST API (Prisma + SQLite)
├── e2e/             Playwright E2E & API tests
├── .github/         Build log, CI pipeline
├── Dockerfile       Multi-stage production build
└── docker-compose.yml
```

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Initialize the database
npm run db:migrate
npm run db:seed

# 3. Install Playwright browsers
cd e2e && npx playwright install && cd ..

# 4. Start dev servers (API on :4000, UI on :5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

## Run E2E Tests

```bash
# Headless (all browsers)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

Playwright auto-starts both servers — no need to run `npm run dev` separately.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server + client concurrently |
| `npm run dev:server` | Start Express API only |
| `npm run dev:client` | Start Vite dev server only |
| `npm run test:e2e` | Run Playwright tests (headless) |
| `npm run test:e2e:ui` | Run Playwright tests (UI mode) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |

## Test Coverage

- **10 UI tests** — CRUD flows, validation, search, confirm dialog, navigation
- **8 API tests** — all endpoints, error cases, edge cases
- **4 accessibility tests** — axe-core scans on all pages
- **5 visual regression tests** — screenshot comparisons
- **3 browsers** — Chromium, Firefox, WebKit
- **75 total tests**

## Docker

```bash
# Build and run with Docker Compose
docker compose up --build

# Or build manually
docker build -t demo-site-crud .
docker run -p 4000:4000 demo-site-crud
```

Open **http://localhost:4000** — serves both the API and the React UI.
