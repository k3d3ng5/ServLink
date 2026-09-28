# ADR-008 — Analytics: SQL views first, PostHog later

- Status: Accepted
- Context: $0 pilot; PRD Sec 12 KPIs must be answerable from Day One.
- Decision: Start with Postgres views for 70/70/70 + funnel; add PostHog cloud free tier only when questions exceed SQL comfort.
- Consequences: Pilot dashboard (Phase 8) reads the same views.
