# ADR-010 — Local-first hosting + Cloudflare Tunnel

- Status: Accepted
- Context: No Vercel, no paid hosting; webhooks need public HTTPS.
- Decision: Dev machine runs compose stack; tunnel daemon publishes core-api for Telegram/Paystack webhooks.
- Consequences: Machine stays on during pilot hours. Pre-agreed trigger: first multi-hour outage → move to a VPS.
