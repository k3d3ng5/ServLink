# ADR-007 — Push: Expo Push + Telegram messages

- Status: Accepted
- Context: Each user is reached on the channel they came from (parity rule).
- Decision: Expo Push for App users; Telegram send for bot-originated jobs.
- Consequences: Fallback to Resend email when push fails.
