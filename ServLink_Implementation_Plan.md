# ServLink — Implementation Plan
**From design system → architecture → MVP build → pilot. Derived from `ServLink_Product_Bible_v2.md` (canonical, App-centric).**

Repo state: docs only (`v1` + `v2` PRDs, `.gitignore`, one screenshot). No code, no scaffold, one commit on `main`.

Product shape (locked): **ServLink App + execution core**, Telegram as one adapter. MVP journey: Request → Match → Confirm → Follow-up. Validation: 10–15 real jobs, 70/70/70.

---

## Phase 0 — Foundations & Ways of Working (Week 0, ~3–5 days)

**Goal:** a repo anyone can clone and run; decisions recorded, not oral.

1. **Repo hygiene**
   - Monorepo layout (single language, shared types):
     ```
     ServLink/
       apps/
         consumer-app/      # Expo React Native (App)
         telegram-bot/      # grammY (Telegram adapter)
         dispatch-console/  # Next.js web (human matching UI, concierge)
       services/
         core-api/          # execution core: REST + webhooks
       packages/
         core-domain/       # shared TS types, state machine, validation schemas
         adapter-kit/       # NormalizedRequest interface + channel deliver() contract
         design-tokens/     # StyleDictionary tokens → TS + NativeWind/Tailwind
       docs/
         adr/               # architecture decision records
         runbooks/          # concierge SOP, pilot ops
       infra/
         docker-compose.yml # postgres + api + bot + console + tunnel
         cloudflared.example.yml
       .github/workflows/   # CI
     ```
   - Branching: `main` (protected) ← short-lived `feat/*`; PR + review; squash merge.
   - Commit the v2 App-centric edits + archive v1 (`docs/archive/`) to end the two-truth problem.
2. **Environments & secrets**
   - `.env.example` per app; real secrets in provider dashboards only (never committed — `.gitignore` already covers `.env*`).
   - Environments: **local-first**. `infra/docker-compose.yml` runs Postgres 17 + core-api + bot + console on your machine. Public ingress (Telegram/Paystack webhooks) via **Cloudflare Tunnel** (free, one daemon). No staging/prod split until the pilot validates — staging is just a second compose profile when needed.
3. **CI (GitHub Actions):** lint + typecheck + unit tests + build on every PR; EAS build on release tags for the App.
4. **ADRs:** create `docs/adr/` and record every stack decision below (context → decision → consequences). The PRD's own decision framework (FACT / HYPOTHESIS / PRODUCT DECISION / OUT OF SCOPE) applies to engineering too.
5. **Exit criteria:** fresh clone → `docker compose up` + one command per app boots; CI green; ADR-001…006 merged.

---

## Phase 1 — Brand & Design System (Week 1)

**Goal:** ServLink looks like one product on every surface. Note: no brand assets exist yet (`Qubators 3.png` is a session screenshot, not a logo).

1. **Brand sprint (founder-led, 2–3 days)**
   - Name/wordmark lock ("ServLink"), tagline ladder from PRD Sec 2 ("Tell ServLink. We'll help get it done." / "Speak. Match. Book. Done.").
   - Palette: trust-forward (deep green/navy + warm accent),Semantic colors for job states (requested/matched/in-progress/done/rework).
   - Typography: one UI family with strong legibility on low-end Android (e.g. Inter); pairing rule for headings.
   - Tone of voice: plain Nigerian-English, no jargon; message templates for confirmations/follow-ups (App + Telegram share copy).
2. **Design tokens (`packages/design-tokens`, StyleDictionary)**
   - `color.*`, `font.*`, `space.*`, `radius.*`, `elevation.*` → generated TS + NativeWind theme. No hardcoded hex outside tokens (lint-enforced).
3. **Component library (built once, used by App + dispatch console)**
   - Primitives: Button, TextField/PhoneField, Card, BottomSheet, StatusChip (job state), Avatar, RatingInput, EmptyState, ErrorState, Skeleton.
   - States for everything: loading / empty / error / offline. Accessibility: min touch target 44pt, color-contrast AA, screen-reader labels.
4. **Screens spec (MVP only — 5 App screens):** Request (what+where+when+contact) → Confirmation (who's coming) → Job status → Completion confirm → History. Telegram mirrors the same 5 steps as chat flows.
5. **Exit criteria:** token build passes; component gallery screen renders on Android + web; copy deck for all 5 flows approved.

---

## Phase 2 — Architectural Decisions (Week 1–2, alongside Phase 1)

**Goal:** boring, cheap, replaceable. Optimize for a solo founder running a 10-job pilot, not scale.

| # | Decision (recommended default) | Why | Alternative if it hurts |
|---|---|---|---|
| ADR-001 | **TypeScript end-to-end, beginner-simple frameworks** (Express + Zod API, grammY bot, Expo App, Next.js console) | One language, shared types; Express/grammY/Expo chosen over NestJS/RN-CLI for minimal magic and best docs | Revisit only if the team outgrows Express (NestJS) or Expo (bare RN) |
| ADR-002 | **Modular monolith `core-api`** (NestJS or Express + Zod), not microservices | Pilot has one deployable; modules (`requests`, `matching`, `providers`, `notify`) split later if needed | Split only when a module needs independent scaling (Phase 4+, PRD maturity) |
| ADR-003 | **PostgreSQL 17 local (Docker Compose) + Prisma** | $0, full control, no paid backend; Prisma migrations versioned in repo; GUI via DBeaver/pgAdmin; nightly `pg_dump` backup | Managed Postgres (e.g. Neon free tier) if local ops hurt |
| ADR-004 | **Better Auth (self-hosted) + Prisma adapter; email OTP via Resend** | No per-user fees, owns sessions, works with local Postgres; Resend handles email delivery | Add phone-OTP via Termii SMS plugin if email-OTP proves wrong for the beachhead; WhatsApp OTP later |
| ADR-005 | **Expo React Native App, Android + iOS** (EAS builds) | One codebase for both stores; OTA updates; Android APK internal distribution for pilot, iOS via TestFlight | PWA only if installs prove a barrier (measure first) |
| ADR-006 | **Telegram adapter: grammY + webhooks** (long-polling only in local dev) | Same TS as core; webhook suits hosted staging/prod | python-telegram-bot if backend goes Python |
| ADR-007 | **Push: Expo Push** for App; Telegram messages for bot-originated jobs | Each user is reached on the channel they came from (PRD parity rule) | Firebase Cloud Messaging direct if Expo limits hit |
| ADR-008 | **Analytics: PostHog** (self-hosted or cloud) | Funnel + KPI events from Day One (PRD Sec 12) without building dashboards | Plain SQL views first; add PostHog when funnel questions exceed SQL comfort |
| ADR-009 | **Cloudflare R2 (S3-compatible)** for job photos/provider docs | Generous free tier, zero egress fees, presigned URLs | Local MinIO only for fully-offline dev if needed |
| ADR-010 | **Local-first hosting: dev machine as server (Docker Compose) + Cloudflare Tunnel for public ingress** | $0, no Vercel/Supabase; tunnel gives Telegram + Paystack webhooks a public HTTPS URL; LAN + Expo Go for App testing | VPS (~$5/mo) at the first multi-hour outage; Tailscale as tunnel alternative |

**Core domain contracts (in `packages/core-domain`, tested, versioned):**
- `NormalizedRequest { what, category?, zone, address, when, contact{channel, handle, phone}, note? }` — every adapter must produce this; nothing else enters the core.
- **Job state machine:** `REQUESTED → MATCHED → CONFIRMED → IN_PROGRESS → DONE_PENDING_CONFIRM → COMPLETED`, with `CANCELLED` from any pre-completion state, plus `FOLLOW_UP_SENT` and `REWORK_REQUESTED → REMATCHED`. All transitions append to `status_events` (audit log, never updated/deleted).
- **Adapter contract** (`packages/adapter-kit`): `normalize(raw) → NormalizedRequest`; `deliver(event) → void`. Adding WhatsApp/voice later = new adapter implementing the same two functions. Contract-tested in CI.

**Exit criteria:** ADRs merged; `core-domain` state machine unit-tested (all transitions + illegal-transition rejections); adapter contract test passes with a stub adapter.

---

## Phase 3 — Execution Core API (Weeks 2–3)

**Goal:** the product's heart beats: intake → log → match → confirm → follow-up, all auditable.

1. **Data model (Prisma; SQLite `file:./dev.db` for dev, Postgres-compatible so the pilot switch is one line):**
   - `customers(id, phone, name?, channel, handle, created_at)`
   - `providers(id, name, phone, categories[], zones[], radius_km, tier, verification_status, availability, created_at)`
   - `provider_applications(id, name, phone, categories[], zones[], telegram_chat_id, skill_note, photo_url, status, reviewed_by, created_at)` — provider self-registrations; console approval creates the `providers` row (tier Basic).
   - `zones(id, name)` seeded: Gwarinpa, Wuse 2, Jabi, Maitama, Asokoro; `categories(id, name)` seeded: the 8 PRD categories.
   - `requests(id, customer_id, category_id?, zone_id, address, description, preferred_time, source_channel, status, created_at)` — the normalized request.
   - `jobs(id, request_id, provider_id, matched_by, matched_at, confirmed_at, started_at, done_at)` — one active job per request; rematches create new rows (history preserved).
   - `status_events(id, request_id, from_status, to_status, actor, at, note)` — append-only audit.
   - `follow_ups(id, job_id, sent_at, channel, response?, confirmed_ok?)`, `ratings(id, job_id, score, note?)`, `rework_tickets(id, job_id, reason, status)`.
2. **Endpoints (REST, Zod-validated):** `POST /requests` (intake) · `GET /requests/:id` · `POST /jobs` (manual match, concierge) · `POST /jobs/:id/confirm|start|done` · `POST /jobs/:id/followup` · `POST /jobs/:id/rate` · `POST /jobs/:id/rework` · `GET /providers?category&zone` · admin `GET /metrics` (match/completion/confirm rates).
3. **Notifications module:** event → template → channel delivery via Expo Push, Telegram send, and **Resend (email: receipts, follow-up fallback)**. Templates shared from the Phase-1 copy deck; every send logged.
4. **Follow-up worker:** cron/queue job that sends post-job follow-up (default +24h after `done`, configurable) and records the response — this is the recourse loop, not an afterthought.
5. **Exit criteria:** full lifecycle driveable via API tests (request → match → confirm → done → follow-up → rating); audit log complete for every transition; seeded zones/categories in staging.

---

## Phase 4 — Consumer App, Minimal (Weeks 3–4)

**Goal:** the 5 screens from Phase 1, talking to the real core. Nothing else.

1. **Screens/flows:** Onboarding (phone OTP) → Request form (category picker, zone picker defaulting from saved area, address, description, photo optional, preferred time) → Confirmation (provider name/photo, ETA window, job reference) → Job status (live state from API polling; no sockets yet) → Completion confirm ("Was it done well? Yes / No → rework") → History list.
2. **Offline tolerance:** request drafts persist locally; queued submit with retry; read-only caches of active job. (Full offline = non-goal; Abuja network reality = retry, not offline-first.)
3. **Errors in plain language** (per copy deck), one-tap retry, support fallback (call/Telegram deep link).
4. **EAS builds:** internal-distribution APK for pilot testers; version + build number recorded per job event for debugging.
5. **Exit criteria:** founder + 2 testers complete a fake lifecycle on staging App; crash-free; request appears in dispatch console (Phase 6).

---

## Phase 5 — Telegram Adapter, Parity (Weeks 3–4, parallel with Phase 4)

**Goal:** same core, same log, chat-shaped. Proves channel-independence.

1. **Bot flows (grammY, webhook):** `/start` → what-do-you-need (free text + category quick-replies) → zone (quick-reply buttons for the 5 zones) → address/location → phone (Telegram contact button) → summary + confirm → request created → later: match confirmation card, completion question with Yes/No buttons.
2. **Identity linking:** Telegram `chat_id` ↔ `customers` row; if the same phone later signs into the App, rows merge (phone is the key, not channel).
3. **Provider self-registration (`/provider`):** name → categories (multi-select) → zones → phone (contact button) → skill note + work photo → application created; applicant gets "under review" status they can check with `/mystatus`.
4. **Admin guardrails:** rate-limit intake per chat; unknown-zone fallback asks for nearest landmark + stores raw text; all bot-created requests and applications visible in dispatch console identically to App ones.
5. **Exit criteria:** parity checklist passes — every App flow has a Telegram equivalent hitting the same endpoints and producing the same `status_events`; provider registration → approval → first match exercised in staging; 3 staged dry-runs logged end-to-end.

---

## Phase 6 — Dispatch Console, Concierge UI (Week 4)

**Goal:** make the human matcher fast and consistent — this is the "Manual" in manual matching.

1. **Next.js internal app (auth-gated, reports-first — matching is automatic):** inbound queue (all requests with live states) → request detail (suggestion ranking shown for transparency + manual override Match) → job board by state → follow-up inbox → rework queue → provider applications inbox → **metrics + analytics pages (the founder's daily view)**.
2. **SOP embedded:** matching SLA timer visible per request (2-hour validation threshold, PRD Sec 11); escalation highlight past 60 min unmatched.
3. **Exit criteria:** founder matches 5 staged requests in <5 min each; every action writes `status_events` with `actor=concierge`.

---

## Phase 7 — Trust & Matching v1 (Qubators Weeks 2–4 band)

**Goal:** graduate from memory-and-notebook to system, without over-automating.

1. **Structured provider profiles** (behind console): skills, zones, radius, availability windows, verification checklist per tier (Basic → Verified → Professional per PRD Sec 13).
2. **Rule-based matching service** (shared by App + all adapters): `category + zone → eligible → rank by (tier, availability, past completion, distance proxy)`. Manual override always allowed; override reason logged (data for the future AI layer).
3. **Ratings + rework flow:** post-follow-up 1–5 + note → provider aggregates; "Not done well" opens `rework_ticket` → rematch or callback task. Ratings tied to real jobs only (anti-fake-review, PRD Sec 18).
4. **Reliability score v0:** implement PRD weighting as a computed view (not a public badge yet — validate correlation with repeat usage first).
5. **Exit criteria:** 100% of pilot matches go through the service (even when overridden); rework path exercised at least once in staging.

---

## Phase 8 — Validation Instrumentation (from Day One of pilot, hardened Week 5)

**Goal:** the 70/70/70 verdict is a query, not an argument.

1. **Event taxonomy** (PostHog + SQL views): `request_created, matched, match_confirmed, job_started, job_done, followup_sent, followup_ok, rated, rework_opened, repeat_request`.
2. **Pilot dashboard** (console page or Metabase): requests → match rate (<2h) → completion rate → confirm-OK rate → repeat-intent count, segmented by zone/category/channel (App vs Telegram — the parity bet is measured here).
3. **Kill-criteria watchlist** (PRD Sec 19): leakage signals (customer rate of direct rehire attempts), cancellation rate, CAC vs expected contribution, category/zone fragmentation.
4. **Exit criteria:** dashboard answers all four validation questions live; weekly review ritual scheduled with Qubators milestones.

---

## Phase 9 — Hardening: Security, Privacy, Safety (Week 5, before real customers)

**Goal:** real-world services + real PII demand more than a prototype.

1. **Security:** OTP rate limits, auth on all endpoints, RLS on storage, secrets rotation runbook, dependency scanning in CI, basic abuse limits on intake.
2. **Privacy (NDPR — Nigeria Data Protection Regulation):** data minimization (collect only `what+where+when+contact`), consent copy at signup, retention policy (request logs vs PII), export/delete-on-request procedure, access control on console.
3. **Safety:** high-risk categories (electrical/gas/structural) flagged — Verified tier minimum + safety disclaimer in confirmation copy; never imply platform guarantees physical safety (PRD Sec 21).
4. **Payments (vendor locked: Paystack, still post-MVP per PRD Won't-Have):** build only the seams now — `amount_agreed` + `paystack_ref` nullable columns, webhook handler stub behind the tunnel URL. No charge flows until validation passes; commission math (10–12% hypothesis) modeled off logged amounts.
5. **Exit criteria:** security/privacy checklist signed; safety copy reviewed; staging pen-test-lite (OWASP Top-10 pass) done.

---

## Phase 10 — Pilot Ops Runbook (Week 5–6 → live)

**Goal:** 10–15 real jobs, executed like an operation, not a demo.

1. **Supply — self-registration funnel, from zero, Week 1 (critical path, runs parallel with build):**
   - Providers register themselves: Telegram bot `/provider` flow (name, categories, zones, phone, skill note, work photo) → `provider_applications` row → founder reviews in console inbox → approve assigns tier Basic, reject with reason.
   - Sourcing the funnel (in order): personal referrals asking artisans to self-register → estate/area WhatsApp groups in the 5 launch zones (registration link) → artisan clusters/markets → repeat-customer recommendations from early jobs.
   - Target: 5–10 approved providers, minimum 2 each in Plumbing + Electrical, covering Gwarinpa, Wuse 2, Jabi first; Maitama/Asokoro once matched.
   - Verification stays human in the MVP (call references, confirm identity + skill evidence) — self-registration removes founder data-entry, not founder judgment. Never seed fake providers (PRD Sec 18).
2. **Demand:** launch to beachhead (new residents/renters channels: estate groups, relocation contacts) — App APK + Telegram link side by side.
3. **Concierge SOP (`docs/runbooks/concierge.md`):** automation handles matching (offer → accept/decline → escalate, 5-min windows, max 3 offers); humans handle only exceptions flagged by admin alerts (no online providers, offers exhausted, reworks, disputes), approval of provider applications, end-of-day metrics review.
4. **Support:** one human phone line + Telegram fallback during pilot hours; every complaint becomes a `rework_ticket` or logged feedback.
5. **Weekly verdict:** score 70/70/70 + repeat-intent; kill-criteria check; findings written back into PRD Part B (the living-document rule).
6. **Exit criteria (pilot success = PRD Sec 11):** ≥70% matched <2h, ≥70% completed, ≥70% confirmed OK, ≥3 would reuse — then greenlight Marketplace MVP (Phase 2 roadmap).

---

## Phase 11 — Beyond MVP (mapped, not built)

- **Marketplace MVP:** App tracking/history, provider app-lite (accept/decline), deposits/escrow design, repeat booking.
- **AI Concierge:** intent classification trained on logged overrides + free-text corpus from pilot; human-in-the-loop retained.
- **Dispatch Intelligence → B2B → Academy → Service Intelligence:** per PRD Sec 16; each phase gated on the previous phase's validation numbers, never on ambition.

---

## Open Questions for Founder (answer before Phase 2 coding)

1. **Stack comfort (RESOLVED — beginner):** simplified TS defaults locked (Express over NestJS, Expo managed workflow, Prisma). Every scaffold ships a README with copy-paste commands.
2. **Platforms (RESOLVED — both):** Android (APK internal distribution) + iOS (TestFlight) via EAS from Day One.
3. **Auth (RESOLVED):** Better Auth + Resend email-OTP for pilot login. Phone-SMS (Termii) only if email-OTP fails with the beachhead.
4. **Provider sourcing (RESOLVED):** recruitment starts from zero — see Phase 10. This is the critical path: start Week 1, parallel with build.
5. **Cost watch (resolved $0 local-first):** R2, Resend, and Paystack free tiers cover the pilot; only SMS (if Termii is added) would add cost — flag before adding.

## Risks & Mitigations

| Risk | Mitigation in this plan |
|---|---|
| App + Telegram in V0 doubles surface | Shared core/contracts; Telegram is thin adapter; parity checklist, not duplicate logic |
| Liquidity failure (no provider available) | 5 launch zones max, in-person supply first, SLA timers, fragmentation dashboard |
| Leakage off-platform | Value-on-platform (history, rework guarantee, reminders), measured not blocked |
| Over-engineering (AI/tracking too early) | Phase gates + ServLink Rule; AI only after override corpus exists |
| PII/safety incident | Phase 9 before real customers; tier-gated high-risk categories |
| Founder bottleneck (solo) | Boring stack, managed services, concierge-first (humans scale later) |
| Local machine as server (power loss, sleep, NAT, no public IP) | Cloudflare Tunnel auto-reconnect; disable sleep during pilot hours; move to a VPS on the first multi-hour outage — pre-agreed trigger, not a debate |

*Plan status: DECISIONS LOCKED (local Postgres + Prisma, Better Auth + Resend email-OTP, Cloudflare R2, Paystack-later, local-first hosting). Open: founder stack comfort (Q1), Android-only vs iOS (Q2). Next: Phase 0 scaffold.*
