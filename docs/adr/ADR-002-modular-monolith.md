# ADR-002 — Modular monolith core-api

- Status: Accepted
- Context: 10-job pilot, one deployable, solo operator.
- Decision: One `core-api` with modules (requests, matching, providers, notify). No microservices.
- Consequences: Split only when a module needs independent scaling (Phase 4+ maturity).
