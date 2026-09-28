# ADR-004 — Better Auth + Resend email-OTP

- Status: Accepted
- Context: No paid auth; local Postgres; email-OTP acceptable for pilot.
- Decision: Self-hosted Better Auth with Prisma adapter; Resend delivers OTP + receipts.
- Consequences: Phone-SMS (Termii plugin) only if email-OTP fails with the beachhead.
