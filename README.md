# Events Table

Full-stack monorepo with a filterable, sortable, paginated events table. Frontend reads directly from PostgREST; the NestJS service is scaffolded but unused.

## Stack

- **Frontend** — React 19 + Vite + TypeScript + Tailwind + Radix UI + React Query (`packages/frontend`, port `5173`)
- **Read API** — PostgREST exposing the DB as REST (`localhost:3000`)
- **DB** — Postgres 16 + Prisma schema (`packages/api/prisma`)
- **Backend (dormant)** — NestJS + Prisma (`packages/api`, port `3001`) — runs in Docker but the frontend never calls it
- **Shared types** — `@events/types` (`packages/types`)

## Prerequisites

- Node.js 20+
- PNPM 10+
- Docker + Docker Compose

## Getting started

```bash
pnpm install
export OPENAI_API_KEY=sk-...   # required for the natural-language search endpoint
docker compose up -d        # db + postgrest + api
pnpm db:push                # apply Prisma schema
pnpm db:seed                # 100 fake events
pnpm dev                    # frontend on :5173
```

Open http://localhost:5173.

### Environment variables

| Var | Where | Purpose |
|-----|-------|---------|
| `OPENAI_API_KEY` | `api` service | Required for `POST /events/nl-search` (natural-language → Prisma filter). |
| `OPENAI_MODEL` | `api` service | Model used for the NL parser. Defaults to `gpt-4o-mini`. |
| `VITE_API_BASE_URL` | frontend | PostgREST base URL (default `http://localhost:3010`). |
| `VITE_NEST_API_BASE_URL` | frontend | NestJS API base URL for NL search (default `http://localhost:3011`). |

## Layout

```
packages/
├── types/                  # @events/types — shared TS types
├── api/                    # NestJS + Prisma (dormant)
└── frontend/               # Vite app
    ├── index.html
    ├── main.tsx            # entry — only file at root besides configs
    └── app/
        ├── shared/         # types, components, hooks, assets, styles, utils
        └── events/         # module: services, hooks, components, index.tsx (page entry)
```

## Ports

| Service    | URL                    |
|------------|------------------------|
| Frontend   | http://localhost:5173  |
| PostgREST  | http://localhost:3010  |
| NestJS     | http://localhost:3011  |
| Postgres   | `localhost:5433`       |
