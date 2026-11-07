# Kanbot Client

AI-assisted project and sprint management frontend for **Kanbot**.

This application is a React single-page app that talks to the Kanbot REST API. It provides authentication, multi-project workspaces, backlog management, a drag-and-drop sprint board, sprint history, and an in-app AI assistant (chat, task generation, sprint planning, and summaries).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Project](#running-the-project)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Kanbot helps individuals and small teams plan work in sprints with optional AI assistance.

The client is responsible for:

- User authentication (login / register)
- Project CRUD and workspace navigation
- Backlog task management
- Active sprint board with drag-and-drop status moves
- Sprint lifecycle (create, start, complete, history)
- AI drawer (chat, generate todos, plan sprint, summarize sprint)
- Light / dark theme with persistence

It expects a running Kanbot backend (default: `http://localhost:4000/api`).

---

## Features

| Feature | Description |
|--------|-------------|
| **Authentication** | Email/password login and registration; JWT stored in `localStorage`; session restore via `/auth/me` |
| **Route guards** | `ProtectedRoute` for authenticated pages; `GuestRoute` for login/register |
| **Projects** | List, create, edit, delete projects; stats cards and progress |
| **Backlog** | List/filter backlog todos; create, edit, delete; AI generate entry point |
| **Active Board** | Four-column board (To Do / In Progress / In Review / Done) with `@dnd-kit` drag-and-drop via `POST /todos/:id/move` |
| **Sprint History** | List sprints by status; start/complete flows; open board context |
| **AI Assistant** | Drawer with chat, generate-todos, plan-sprint, and sprint summary (backed by API) |
| **Theme** | Light and dark modes (MUI themes + CSS variables); toggle; `localStorage` persistence; FOUC prevention |
| **Responsive shell** | Sidebar (desktop) / drawer (mobile); glass top bar; brand logo |
| **Toasts** | `sonner` notifications for success/error feedback |
| **Error boundary** | Catches render errors and shows a recovery UI |

---

## Tech Stack

### Core

| Layer | Technology |
|-------|------------|
| UI library | React 19 |
| Language | TypeScript 5.7 |
| Bundler / dev server | Vite 6 |
| Routing | React Router DOM 7 |
| UI components | MUI 6 (`@mui/material`, `@mui/icons-material`) |
| Styling | Emotion (via MUI) + global CSS variables |

### Data & forms

| Concern | Library |
|---------|---------|
| HTTP client | Axios |
| Server state | TanStack Query (React Query) 5 |
| Client state | Zustand 5 |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| Drag and drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Markdown (AI replies) | `react-markdown` |
| Toasts | `sonner` |
| Dates | `date-fns` |

### Tooling

- ESLint 9 + TypeScript ESLint
- `@vitejs/plugin-react`

---

## Project Structure

```text
kanbot-client/
├── public/
│   ├── kanbot-logo.png          # Brand logo (full mark)
│   └── vite.svg
├── src/
│   ├── api/                     # Axios API modules (auth, projects, todos, sprints, ai)
│   │   └── client.ts            # Axios instance, auth header, error mapping
│   ├── components/
│   │   ├── brand/KanbotLogo.tsx
│   │   ├── feedback/            # ErrorBoundary, PageLoader
│   │   └── theme/ThemeToggle.tsx
│   ├── features/
│   │   ├── ai/components/AiDrawer.tsx
│   │   ├── auth/pages/          # Login, Register + Zod schemas
│   │   ├── backlog/pages/
│   │   ├── board/pages/
│   │   ├── projects/pages/
│   │   └── sprints/pages/
│   ├── guards/                  # ProtectedRoute, GuestRoute, GuardLoader
│   ├── hooks/                   # TanStack Query hooks
│   ├── layouts/AppShell.tsx     # Sidebar + top bar + outlet
│   ├── lib/                     # constants, utils
│   ├── stores/                  # authStore, uiStore (Zustand)
│   ├── theme/theme.ts           # lightTheme / darkTheme + sidebar tokens
│   ├── types/api.ts             # Shared API TypeScript contract
│   ├── styles/global.css
│   ├── App.tsx                  # Route tree
│   └── main.tsx                 # Providers (Query, Theme, Router, Toaster)
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Path alias: `@/*` → `src/*` (configured in `vite.config.ts` and `tsconfig.json`).

---

## Prerequisites

- **Node.js** 18+ (recommended: current LTS)
- **npm** 9+ (or compatible package manager)
- Running **Kanbot API** (backend) on the URL configured in `VITE_API_URL`

---

## Installation and Setup

```bash
# 1. Enter the client directory
cd kanbot-client

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
```

Edit `.env` if your API is not on the default host/port:

```env
VITE_API_URL=http://localhost:4000/api
```

> Do not commit real secrets. The client only needs the public API base URL.

Ensure the backend is running and CORS allows the Vite origin (`http://localhost:5173`).

---

## Running the Project

```bash
# Development (http://localhost:5173)
npm run dev

# Type-check + production build
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

Typical local workflow:

1. Start the Kanbot server (`kanbot-server` → port `4000`).
2. Start this client (`npm run dev` → port `5173`).
3. Open `http://localhost:5173`.

---

## Architecture

### Providers (`main.tsx`)

- `QueryClientProvider` — server state cache
- `ThemeProvider` + `CssBaseline` — MUI light/dark themes from `uiStore.themeMode`
- `BrowserRouter` — client routing
- `ErrorBoundary` — UI error isolation
- `Toaster` (`sonner`) — mirrors current theme

Theme is bootstrapped early (`bootstrapTheme` + inline script in `index.html`) to reduce flash of the wrong theme.

### Routing & guards

| Route | Access | Page |
|-------|--------|------|
| `/login`, `/register` | Guests only (`GuestRoute`) | Auth pages |
| `/projects` | Authenticated (`ProtectedRoute`) | Project list |
| `/projects/:projectId/backlog` | Authenticated | Backlog |
| `/projects/:projectId/board` | Authenticated | Active sprint board |
| `/projects/:projectId/sprints` | Authenticated | Sprint history |
| `/` | Redirect → `/projects` | — |

On `401 UNAUTHORIZED` (non-auth endpoints), the Axios interceptor clears the token and dispatches `kanbot:unauthorized`; `App` listens and clears React Query cache.

### State management

| Store / layer | Responsibility |
|---------------|----------------|
| `authStore` (Zustand) | `user`, `token`, `initialize`, `setAuth`, `clearAuth` |
| `uiStore` (Zustand) | `themeMode`, AI drawer open, current project id helpers |
| TanStack Query | Projects, todos, sprints, board data; mutations invalidate related keys |

### API client

- Base URL: `import.meta.env.VITE_API_URL` (fallback `http://localhost:4000/api`)
- Header: `Authorization: Bearer <token>` when present
- Errors mapped to `ApiError` with `status`, `code`, `message`, optional `details`

---

## API Integration

All paths are relative to `VITE_API_URL` (e.g. `http://localhost:4000/api`).

### Auth

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/auth/register` | No |
| `POST` | `/auth/login` | No |
| `GET` | `/auth/me` | Bearer |

### Projects

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/projects` | Bearer |
| `POST` | `/projects` | Bearer |
| `GET` | `/projects/:id` | Bearer |
| `PATCH` | `/projects/:id` | Bearer |
| `DELETE` | `/projects/:id` | Bearer |

### Todos

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/projects/:projectId/todos` | Bearer |
| `POST` | `/projects/:projectId/todos` | Bearer |
| `POST` | `/projects/:projectId/todos/bulk` | Bearer |
| `GET` | `/todos/:todoId` | Bearer |
| `PATCH` | `/todos/:todoId` | Bearer |
| `POST` | `/todos/:todoId/move` | Bearer |
| `DELETE` | `/todos/:todoId` | Bearer |

### Sprints

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/projects/:projectId/sprints` | Bearer |
| `POST` | `/projects/:projectId/sprints` | Bearer |
| `GET` | `/sprints/:sprintId` | Bearer |
| `GET` | `/sprints/:sprintId/todos` | Bearer (board columns) |
| `PATCH` | `/sprints/:sprintId` | Bearer |
| `POST` | `/sprints/:sprintId/start` | Bearer |
| `POST` | `/sprints/:sprintId/complete` | Bearer |
| `DELETE` | `/sprints/:sprintId` | Bearer |

### AI

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/ai/status` | Bearer |
| `POST` | `/projects/:projectId/ai/chat` | Bearer |
| `POST` | `/projects/:projectId/ai/generate-todos` | Bearer |
| `POST` | `/projects/:projectId/ai/plan-sprint` | Bearer |
| `POST` | `/sprints/:sprintId/ai/summary` | Bearer |

Response shapes and error codes are defined in `src/types/api.ts` (shared contract with the backend).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (for non-default setups) | Base URL of the Kanbot API, including `/api`. Example: `http://localhost:4000/api` |

Only variables prefixed with `VITE_` are exposed to the browser by Vite.

---

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server on port **5173** |
| `build` | `tsc --noEmit && vite build` | Type-check and production bundle |
| `preview` | `vite preview` | Serve the production build |
| `lint` | `eslint .` | Lint the project |

---

## Future Improvements

Suggestions only (not implemented unless already present above):

- Automated unit/E2E tests (Vitest / Playwright)
- Keyboard command palette (⌘K) wired to real navigation
- Internationalization (i18n)
- Offline-friendly caching strategies beyond default React Query
- Accessibility audit pass (axe) on all major flows

---

## Contributing

1. Create a feature branch from the main development branch.
2. Keep changes focused; match existing folder conventions (`features/`, `api/`, `hooks/`).
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Document any new environment variables in `.env.example` and this README.

---

## License

No license file is present in this client package. Confirm licensing with the project owner before publishing or redistributing.

---

## Notes for maintainers

- Brand asset: `public/kanbot-logo.png`.
- Theme tokens: `src/theme/theme.ts` (`lightTheme`, `darkTheme`, `sidebarLight`, `sidebarDark`).
- Backend must be reachable at `VITE_API_URL`; network failures surface as *“Cannot reach the server…”* from the Axios interceptor.
