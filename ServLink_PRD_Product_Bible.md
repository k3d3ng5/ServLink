# SERVLINK
### AI-Powered Service Execution & Skills-to-Income Platform
**Product Requirements Document & Product Bible**

Version 1.0 · September 2026 · MVP Definition Stage
Prepared for: Qubators AI Foundry, Cohort 2
Owner: Kedengs Yakong "Yax" Ubayo

---

## Contents
1. Executive Summary
2. Product Brief
3. The Problem
4. Vision
5. Target Users & Market
6. MVP Definition (Scope)
7. Customer Journey
8. Provider Ecosystem
9. Validation Strategy
10. Business Model
11. Long-Term Roadmap
12. Risks & Kill Criteria
13. Glossary

---

## 1. Executive Summary

> *ServLink is an AI-powered service execution platform that helps people get everyday services done by intelligently connecting them with trusted, capable providers — while giving skilled people a pathway to learn, get verified, receive jobs, and earn.*

**Consumer promise:**
> *Speak. Match. Book. Done.*

The core idea isn't "finding a service provider." It's turning a person's request into a completed real-world service — end to end, with trust built in at every step.

This document captures where ServLink stands as it enters Qubators AI Foundry Cohort 2: the confirmed problem, the confirmed first target user, the confirmed MVP scope, and the longer-term vision the MVP is a first step toward.

---

## 2. Product Brief

**User**
Anyone who doesn't have a trusted and reliable contact to call for home repair services. Mostly new residents, renters, and visitors with no local network yet.

**Problem**
No easy way to find trusted service providers quickly. Current options lack verification and accountability, with poor quality assurance.

**Main Journey (App-centric)**
Request → Match → Confirm → Follow-up. Users request via the ServLink App or Telegram (same core): indicate what's broken and where they live, get matched to a vetted provider, are told who's coming, and are asked after the job if it was done well.

---

## 3. The Problem

Finding a reliable service provider in Abuja today is fragmented. The typical process looks like:

> *Ask friends → WhatsApp contacts → search social media → call several people → explain the problem repeatedly → negotiate price → wait → hope they show up → deal with uncertainty.*

Research and personal experience point to two distinct failures inside that process, not one:

- **Discovery failure** — hard to find someone reliable in the first place.
- **Recourse failure** — even after a provider is found, no assurance the work will be done properly, and no straightforward way to get it fixed if it isn't.

Most existing Nigerian competitors address discovery. Almost none specifically address recourse — this is where ServLink can differentiate.

### Competitive Landscape

| Platform | Strength | ServLink's Response |
|---|---|---|
| CitiTasker | Local professional directory | Execution, not just discovery |
| Hustlam | Bidding, protected payment | AI matching over price competition |
| Kwikly | Scale (claims 50K+ providers) | Trust + operational data over raw scale |
| TrustAm | Verification, escrow-style payment | Full transaction lifecycle |
| Vendoh | Voice-powered discovery (launching) | Voice + deeper execution, not just discovery |
| MyFixam | In-app payment, live tracking | Recourse/rework guarantee |
| Worker.ng | Free directory | Verified, accountable matching |
| OgaBuild | Reliability scores, staged payment | Abuja-specific density + voice-first |
| Porchplus | Artisans for renters specifically | Broader category set + AI concierge |

---

## 4. Vision

> *To become an intelligent infrastructure for getting everyday services done.*

A user shouldn't have to understand the service marketplace underneath. They simply tell ServLink what they need — in the ServLink App, or in plain language on Telegram / WhatsApp / web / voice — and ServLink handles the rest: understanding the request, matching supply, coordinating payment, and building trust throughout. The App is the home; other channels are alternate doors to the same core.

Long-term, ServLink is not one product but three interconnected layers:

- **ServLink Consumer (App as home)** — the App is the product home for finding, booking, tracking, and reviewing services. Chat channels (Telegram, WhatsApp), web, and voice are additional interaction mediums that feed the same execution core, not separate products
- **ServLink Business** — B2B service operations and maintenance management
- **ServLink Academy** — train and activate new service providers, creating supply rather than only discovering it

These should not all be built at once — see Section 11, Long-Term Roadmap.

---

## 5. Target Users & Market

**Primary Beachhead (confirmed)**
People with no established local trusted-artisan network — renters, new relocators to Abuja, and tourists/visitors. The shared trait is the absence of a local trust network, not the renter/tourist label itself.

**Parked for Phase 2**
Estates and property managers (B2B). Their core pain — coordinating multiple vendors across many units — and their buyer (a manager, not a household) differ enough from the consumer beachhead that building for both at once would likely serve neither well.

**Launch Zones**
Gwarinpa, Wuse 2, Jabi, Maitama, Asokoro — chosen for marketplace liquidity (enough demand and supply concentrated together), and validated by real estate market data showing young professionals and civil servants concentrated in exactly these areas.

### Initial Categories

| Category | Why it's a priority |
|---|---|
| Plumbing | High frequency, high urgency, high repeat |
| Electrical | High frequency, high urgency, high repeat |
| AC/HVAC | High frequency, high urgency, high repeat |
| Cleaning | High frequency, very high repeat potential |
| Generator/Solar | Medium frequency, high urgency |
| Handyman | Medium frequency, high repeat |
| Moving | Medium frequency, high urgency, low repeat |
| Auto assistance | High frequency, high urgency |

---

## 6. MVP Definition (Scope)

Defined using MoSCoW prioritization — sorting every possible feature by how essential it is to testing whether the core idea works at all.

**Design Principle: App-centric, Telegram as one adapter.**
The product is the **ServLink App + execution core** (Request → Match → Confirm → Follow-up + logs). The App is the home for requests, status, history, and trust. Telegram — plus later WhatsApp, web widget, voice — are interaction mediums (adapters) that feed a normalized request (`what + where + when + contact`) into the same core and return confirmations/follow-ups. No channel owns the logic; all share one core and one request log.

| Priority | Features |
|---|---|
| **Must Have (Day 1)** | Execution core: normalized intake + zone capture, 5–10 vetted providers, manual matching, central request log, post-job follow-up. **Consumer App (minimal):** submit request, see match confirmation (who's coming), confirm completion. **Telegram adapter (parity):** plain-language request + location in chat, receive same confirmation/follow-up. Same core, same log, either entry point |
| **Should Have (soon after)** | Structured provider list decoupled from App/channels; rule-based matching service (category + zone → suggest provider) shared by App + all adapters; App job tracking/history; second lightweight adapter (WhatsApp or web widget) if needed |
| **Could Have (later — maps to Qubators Weeks 2–4)** | Shared AI understanding layer across App + all channels; visible rating/reputation in App; formal rework/callback flow in App + Telegram; voice as an additional adapter |
| **Won't Have Yet** | In-app payments; live tracking; property-manager features; more than one city |

---

## 7. Customer Journey

**MVP Journey (confirmed, App-centric)**
Request → Match → Confirm → Follow-up. The customer requests in the App or via Telegram; the core normalizes it, matches to a vetted provider, confirms who's coming (visible in App + echoed on originating channel), and follows up after the job on whether it was done well.

**Full Long-Term Journey (future vision)**
Tell → Understand → Match → Compare → Book → Pay → Execute → Track → Complete → Review. The MVP proves the middle of this chain works manually before automating and expanding either end of it.

---

## 8. Provider Ecosystem

Each provider should eventually have a service identity, not just a listing: skills, categories, location, service radius, availability, verification status, ratings, completed jobs, response/acceptance/cancellation/completion rates, and customer feedback.

**Provider Tiers**
- **Basic** — phone verified
- **Verified** — identity, skill evidence, and references checked
- **Professional** — strong performance history

### Provider Reliability Score (weighting)

| Factor | Weight |
|---|---|
| Customer rating | 25% |
| Completion rate | 20% |
| Acceptance rate | 15% |
| Punctuality | 15% |
| Cancellation rate | 10% |
| Repeat customers | 10% |
| Dispute history | 5% |

---

## 9. Validation Strategy

The MVP is considered validated against the first 10–15 real requests from real people — not test requests from friends who already trust the founder:

- At least 70% matched to a provider within 2 hours
- At least 70% of matched jobs actually completed
- At least 70% of customers confirm the work was done properly
- At least 3 people would use it again

These thresholds are placeholders, deliberately set before results exist, so they can't be quietly moved later if early results are discouraging.

---

## 10. Business Model

Not all revenue streams launch at once. The MVP is pre-revenue by design — the business model below is the direction, not the Day 1 plan.

| Revenue Stream | Description |
|---|---|
| Provider commission | ~10–12% of job value (planning assumption) |
| Customer service/protection fee | ~2–3% of job value, shown itemized, never hidden |
| B2B subscriptions | Recurring service-management contracts (Phase 2) |
| ServLink Academy | Training/certification fees (later) |
| Provider premium tools | Advanced analytics, CRM, priority leads (later) |

A companion Unit Economics & Growth Scenario spreadsheet models contribution per job, break-even volume, and TAM/SAM/SOM sizing against these assumptions in detail.

---

## 11. Long-Term Roadmap

| Stage | Goal |
|---|---|
| V0 — Concierge | Human + execution core with minimal Consumer App + Telegram as parallel entry point. Prove demand and the recourse promise. |
| V1 — Marketplace MVP | Consumer App as home (tracking/history), structured provider list, rule-based matching shared by App + adapters, basic ratings. Prove transactions. |
| V2 — AI Concierge | Natural-language intent recognition as shared understanding layer across App + all channels, conversational clarification. |
| V3 — Dispatch Intelligence | Geospatial matching, ETA, provider scoring, live status. |
| V4 — B2B | Service tickets, property management, recurring contracts. |
| V5 — ServLink Academy | Training, assessment, verification, apprenticeship pipeline. |
| V6 — Service Intelligence | Demand forecasting by zone, category, and season. |

---

## 12. Risks & Kill Criteria

Conditions under which the model should be reconsidered or fundamentally changed, not stubbornly continued:

- Customers refuse to pay through the platform
- Providers consistently bypass the platform (leakage)
- Average job value too low to support acquisition and support costs
- Provider cancellation rate persistently high
- Demand too fragmented across categories/zones to reach liquidity
- Customer acquisition cost exceeds expected lifetime contribution
- Real-time location/dispatch doesn't materially improve fulfilment enough to justify the investment

---

## 13. Glossary

| Term | Meaning |
|---|---|
| MVP | Minimum Viable Product — the smallest version that can genuinely test whether the idea works |
| MoSCoW | A prioritization method: Must have, Should have, Could have, Won't have (yet) |
| GMV | Gross Merchandise Value — total value of all transactions flowing through the platform |
| CAC | Customer Acquisition Cost — what it costs to acquire one paying customer |
| LTV | Lifetime Value — total contribution a customer generates over their relationship with the platform |
| Fill Rate | Percentage of legitimate service requests successfully fulfilled |
| Contribution margin | Revenue left per transaction after direct/variable costs, before fixed costs |
| Beachhead | The first, narrow customer segment a product focuses on before expanding |

---

*This document is a living artifact — update it as Qubators milestones and MVP validation results come in, rather than treating it as fixed on the day it was written.*
