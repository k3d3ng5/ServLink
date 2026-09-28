# ADR-003 — Local PostgreSQL 17 + Prisma

- Status: Accepted
- Context: Supabase is paid; pilot must cost $0.
- Decision: Docker Compose `postgres:17-alpine`, Prisma migrations in repo, DBeaver GUI, nightly `pg_dump`.
- Consequences: Founder owns backups/uptime. Escape hatch: managed Postgres (Neon free tier).
- 2026-09-28 update: Docker engine failed to start (pipe missing after 5-min wait), so pilot runs PostgreSQL from EnterpriseDB binaries at `%LOCALAPPDATA%\Programs\pgsql17` (no Docker, no admin). Compose file kept for when Docker is fixed — stop the binary server first to avoid a port-5432 clash.
