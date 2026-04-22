# Flexpay API backend

Standalone **Express** server that exposes the same REST surface as the Next.js `app/api/*` route handlers. Business logic lives in `../frontend/lib/server/*` so the web app and this service stay in sync.

## Project layout (`src/`)

| Path | Role |
|------|------|
| `server.ts` | App bootstrap: env, HTTP server, middleware, routes, workers/WebSocket hooks |
| `routes/` | Express routers (`/health`, `/api/*`) |
| `controllers/` | Request/response adapters (call services, `sendJson`) |
| `services/` | Thin domain facades over shared `frontend/lib/server` handlers |
| `database/` | Re-exports Prisma client (`frontend/lib/db`) for future repo-local DB helpers |
| `middleware/` | CORS, body parsers, 404 + error handler |
| `utils/` | Env loader, HTTP helpers |
| `websocket/` | Placeholder for real-time (Socket.io / `ws`) |
| `workers/` | Placeholder for queues / cron |

## When to use it

- Deploy the API on a different host or process than the Next.js UI.
- Point mobile or third-party clients at `BACKEND_PORT` with CORS enabled.
- Keep **AfricasTalking** webhooks on a stable API URL (this server or Vercel — not both unless paths differ).

## Setup

From the **repository root**:

```bash
npm install
```

Prisma client is generated for this workspace via `postinstall` (same schema as `frontend/prisma`).

Environment variables are the same as the frontend (load order: `frontend/.env.local`, `frontend/.env`, `backend/.env`). At minimum:

- `DATABASE_URL` — Postgres for orders/prices (optional for local demo UI).
- `NEXT_PUBLIC_AIRTIME_CONTRACT_ADDRESS`, treasury + AfricasTalking vars — for `/api/airtime/*`.

## Run

```bash
npm run dev:backend
```

Defaults to **port 4000**. Override with `BACKEND_PORT`.

Optional CORS allowlist (comma-separated origins):

```bash
CORS_ORIGIN=http://localhost:3000,https://yourapp.com npm run dev:backend
```

## Point the Next app at this API (optional)

Set in `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Then replace `fetch('/api/...')` in the client with `fetch(\`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/...\`)` where you want the split. Until then, the UI keeps using same-origin Next API routes.

## Routes

| Method | Path | Notes |
|--------|------|--------|
| GET | `/health` | Liveness |
| GET | `/api/prices?currency=KES` | FX / cached price |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:orderRef` | Order status JSON |
| GET | `/api/geo` | Reads `x-vercel-ip-*` headers when present |
| POST | `/api/log` | Structured server log |
| GET | `/api/auth` | Farcaster quick-auth |
| POST | `/api/airtime/send` | JSON body |
| POST | `/api/airtime/validate` | JSON body |
| POST | `/api/airtime/status` | `application/x-www-form-urlencoded` |
