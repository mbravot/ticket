# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (HMR enabled)
npm run build     # Production build (output to /dist)
npm run lint      # ESLint check
npm run preview   # Serve the production build locally
```

No test framework is configured.

## Architecture

**React 19 SPA** — ticket management system with role-based access. Backend URL configured via `VITE_API_URL` in `.env` (defaults to `http://localhost:3000/api`).

### State Management (two layers)

- **Zustand** (`src/store/auth.store.js`): auth state only (`user`, `token`). Methods: `setAuth()`, `logout()`. Token persisted to `localStorage`.
- **React Query** (`@tanstack/react-query`): all server data. Custom hooks in `src/hooks/` wrap query calls.

### API Layer (`src/api/`)

- `axios.js` — configured Axios instance with request interceptor (injects Bearer token) and response interceptor (redirects to `/login` on 401).
- `auth.api.js`, `ticket.api.js`, `catalogo.api.js`, `usuario.api.js` — grouped by domain.

### Routing (`src/router/index.jsx`)

Three route tiers:
- Public: `/login`
- Protected (`RequireAuth`): `/`, `/tickets`, `/tickets/nuevo`, `/tickets/:id`
- Admin (`RequireAdmin`, checks `user.rol === 'admin'`): `/admin/usuarios`, `/admin/reportes`

### Custom Hooks (`src/hooks/`)

Thin React Query wrappers: `useTickets(params)`, `useTicket(id)`, `useDepartamentos()`, `useCategorias(id)`, `useEstados()`, `usePrioridades()`.

### Current Status

Only `Login.jsx` is fully implemented. All other pages (`Dashboard`, `Tickets`, `NuevoTicket`, `TicketDetalle`, `admin/Usuarios`, `admin/Reportes`) are empty stubs. Component directories (`components/layout/`, `components/tickets/`, `components/ui/`) exist but are empty.

## Conventions

- Styling: Tailwind CSS v4 utility classes (no separate config file — configured via Vite plugin).
- ESLint 9 flat config; `no-unused-vars` ignores uppercase-starting names.
- JS/JSX (no TypeScript). Pages use `.jsx`, hooks/API use `.js`.
