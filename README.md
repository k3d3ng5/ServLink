# ServLink

App-centric service-execution platform. **App + execution core** is the product; Telegram (later WhatsApp/web/voice) are adapters.

Docs: `ServLink_Product_Bible_v2.md` (canonical) · `ServLink_Implementation_Plan.md` (build order).

## Quickstart (Phase 0)

Prereqs: Node 22+, Docker Desktop (running), npm.

```powershell
# 1. install all workspace deps
npm install

# 2. start local Postgres 17
npm run dev:infra

# 3. in another shell: run the API (stub)
npm run dev --workspace=services/core-api

# 4. health check
curl http://localhost:3001/health
```

Public webhooks (Telegram/Paystack) need a public URL while hosting locally:

```powershell
npm run dev:tunnel
# copy the https://*.trycloudflare.com URL into BotFather webhook / Paystack dashboard
```

## Layout

- `services/core-api` — execution core (Express + Prisma + Better Auth). Only entry point for business logic.
- `apps/telegram-bot` — Telegram adapter (grammY). Implements `packages/adapter-kit`.
- `apps/consumer-app` — Expo App (Android + iOS). Full scaffold lands in Phase 4.
- `apps/dispatch-console` — concierge UI (Next.js). Full scaffold lands in Phase 6.
- `packages/core-domain` — shared types + job state machine. Import it; never duplicate the states.
- `packages/adapter-kit` — the two-function adapter contract every channel implements.
- `packages/design-tokens` — brand tokens (source of truth for colors/type/space).
- `infra/` — docker-compose + tunnel config.
- `docs/adr/` — architecture decision records. `docs/runbooks/` — pilot ops.
