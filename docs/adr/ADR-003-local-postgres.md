# ADR-003 — Local PostgreSQL 17 + Prisma

- Status: Accepted
- Context: Supabase is paid; pilot must cost $0.
- Decision: Docker Compose `postgres:17-alpine`, Prisma migrations in repo, DBeaver GUI, nightly `pg_dump`.
- Consequences: Founder owns backups/uptime. Escape hatch: managed Postgres (Neon free tier).
