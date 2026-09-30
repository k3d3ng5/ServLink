# ServLink — Google Stitch Prompt Pack
**Product:** ServLink — Uber-style service execution + ChatGPT-style conversational assistant.
**Brand direction:** corporate, professional, luxury, premium.
Paste the Master Style prompt first, then one screen prompt per generation.

---

## MASTER STYLE PROMPT (paste first, reuse every generation)

> Design a premium mobile app interface for "ServLink", a luxury home-services platform in Abuja, Nigeria — the Uber of trusted artisans meets a ChatGPT-style AI concierge.
>
> **Brand:** corporate luxury. Deep emerald (#0B3D2E) primary, champagne gold (#C9A227) accents, ivory (#FAF7F0) backgrounds, charcoal ink (#14201C) text. Generous whitespace, 16px+ corner radii on cards, subtle gold hairline dividers, soft layered shadows — never flat, never neon, never playful.
>
> **Typography:** elegant serif display for headlines (Playfair Display style), clean geometric sans for body and UI (Inter style). Large confident headlines, muted grey secondary text.
>
> **Mood:** private banking meets five-star hotel concierge. Calm, assured, expensive. Every screen must feel like a premium membership, not a marketplace.
>
> **Rules for all screens:** mobile-first portrait (Android flagship), 44pt+ touch targets, bottom-anchored primary actions, status communicated with refined pills and timelines (never raw text dumps), plain Nigerian-English microcopy, no lorem ipsum — realistic Abuja content (Gwarinpa, Wuse 2, Jabi; plumbing, AC, cleaning).

---

## SCREEN 1 — AI Concierge Chat (home)

> ServLink home screen: a ChatGPT-style AI concierge. Centered emerald monogram avatar, serif headline "Good evening. What needs perfecting today?", four elegant starter cards (Leaking tap, AC blowing hot air, No power in one room, Deep clean my flat) as ivory cards with gold chevrons. Bottom: floating pill chat bar ("Message ServLink…") with gold send button. Conversation state: user bubble right-aligned deep emerald with white text; assistant replies as plain serif text with small monogram avatar, plus a typing indicator (three gold dots). After booking completes, a champagne-gold "View my job" card. Luxury, calm, spacious.

## SCREEN 2 — Request Tracking (Uber-style live status)

> ServLink live job tracking screen, Uber-inspired but luxurious: top two-thirds a dark emerald map panel with a gold route line from provider to customer pins and a "4.2 km away" chip. Bottom ivory sheet: status timeline (Requested → Matched → Confirmed → In progress → Done) with gold checkmarks on completed steps; provider card (photo, name, "Verified Pro" gold badge, star rating); job reference code; two buttons — deep emerald "Confirm arrival" and outlined "Report issue". Premium, glanceable in 3 seconds.

## SCREEN 3 — Provider Mode / Driver App (ServLink Pro)

> ServLink Pro — the provider's driver-style home. Bold online/offline toggle card (emerald glow when online: "You're visible to nearby jobs"). Below: an incoming job offer card styled like an Uber request — service icon, problem summary, distance ("1.2 km"), area, payout estimate, and a 5:00 countdown ring in gold, with side-by-side Accept (emerald) / Decline (ghost) buttons. Below: "My jobs" list with status pills and earnings summary row ("This week: ₦48,500 · 6 jobs · ★4.9"). Dark-emerald header, ivory body, gold accents throughout.

## SCREEN 4 — History & Receipts

> ServLink job history screen: list of past bookings as ivory receipt-style cards — service icon, description, provider name with tier badge, date, amount, and color-coded status pill (emerald completed, gold in-progress, grey cancelled). Tap expands to a receipt view: timeline of events, rating given, "Book again" gold button. Membership-statement aesthetic, like a premium bank statement.

## SCREEN 5 — Login & Onboarding

> ServLink login screen: full-bleed deep emerald with subtle gold geometric pattern, centered ivory card — serif "Welcome to ServLink", subtext "Trusted home services, perfected", email field, gold "Send login code" button, then OTP screen with six separated luxury digit boxes. Below: "Continue with Google" and "Continue with Facebook" outline buttons, divider "or". First-run: three swipeable onboarding slides (1. Tell us the problem, 2. We match the closest verified pro, 3. Done right, or we re-do it) with gold dot indicators. Premium fintech onboarding feel.

---

## How Stitch output maps to our codebase (do NOT paste Stitch's Flutter code)

| Stitch gives you | We implement as |
|---|---|
| Colors, radii, spacing, type scale | `apps/consumer-app/src/theme.ts` + `packages/design-tokens/tokens.json` |
| Buttons, cards, chips, pills | `apps/consumer-app/src/ui.tsx` + `src/components.tsx` |
| Screen layouts/flows | `src/app/` routes (index, chat, request, jobs, job/[id], pro, verify) |
| Copy/tone | Bot + app message templates (keep identical across channels) |

Send screenshots or the spec values (hex, radii, spacing) of the winning generation back, and the app gets aligned pixel-close.
