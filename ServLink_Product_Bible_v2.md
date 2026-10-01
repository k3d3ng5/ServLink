# SERVLINK
### Intelligent Service-Execution & Skills-to-Income Platform
**Product Bible — Version 2.0 · September 2026**

Prepared for: Qubators AI Foundry, Cohort 2
Owner: Kedengs Yakong "Yax" Ubayo

> **How to read this document:** Part A and Part B are what you're actually building right now — confirmed decisions and the MVP. Part C is the long-term vision — useful for direction, but explicitly not what gets built yet. This split exists because the document's own rule (Section 16) warns against a Level-1 product pretending to be Level 7.

---

## Contents

**PART A — Foundation**
1. Executive Summary
2. Vision & Mission
3. The Problem
4. Product Thesis
5. Target Users & Market
6. Competitive Landscape & Differentiation
7. Product Principles & The ServLink Rule

**PART B — MVP (Building Now)**
8. MVP Scope
9. What Is NOT MVP
10. Customer & Provider Journey — MVP vs. Full Vision
11. Validation Strategy & Success Definition
12. KPIs to Track from Day One

**PART C — Long-Term Vision (Product Bible)**
13. Trust Architecture & Provider Tiers
14. Business Model & Revenue Streams
15. ServLink Academy & ServLink Business
16. Product Roadmap & Maturity Model
17. Marketplace Mechanics
18. Anti-Features & What ServLink Is Not
19. Major Risks & Kill Criteria
20. North Star Metric
21. Data, Privacy & Safety
22. Global Expansion Model
23. Product Decision Framework
24. Glossary

---

# PART A — FOUNDATION

## 1. Executive Summary

> *ServLink is an intelligent service-execution platform that helps people get everyday services done by connecting them with suitable, trusted and available service providers — while reducing the work required from the customer to find, evaluate, book, coordinate and complete the service.*

**Consumer promise:**
> *Tell ServLink what you need. ServLink helps get it done.*

ServLink is not merely a directory, a bidding marketplace, a verification platform, or a chatbot. It aims to become the infrastructure between a service need and a successfully completed service — starting narrow, in Abuja, and earning the right to expand.

---

## 2. Vision & Mission

**Vision**
> *To become intelligent infrastructure for getting services done.*

**Mission**
> *To make trusted services easier to access while helping skilled people turn their capabilities into sustainable economic opportunity.*

**Customer Promise Ladder**
- Primary: "Tell ServLink. We'll help get it done."
- Supporting: "Speak. Match. Book. Done."
- Long-term: "From everyday problems to completed solutions."

---

## 3. The Problem

**Customer Problem**
Getting everyday services done in Abuja is fragmented — a customer typically has to realize the problem, figure out what kind of professional they need, ask around, evaluate strangers for genuineness and experience, negotiate, coordinate timing and location, wait, monitor the work, pay, and start over if it goes badly.

Personal experience and research confirm two distinct failures inside that process, not one:
- **Discovery failure** — hard to find someone reliable in the first place
- **Recourse failure** — even after a provider is found, no assurance the work is done properly, and no easy way to get it fixed if it isn't

**Provider Problem**
Skilled workers often have technical ability, equipment, and experience, but struggle with predictable customer acquisition, trust/credibility, digital visibility, pricing discipline, scheduling, and reliable payment.

*The ILO's 2022 employment data put informal employment at roughly 92.3% of total employment in Nigeria — a large share of the economy operating without the structure digital platforms could bring, though such platforms also raise real questions about worker protection that shouldn't be waved away.*

> Demand side: How can someone get the right service done with less uncertainty, effort and risk?
> Supply side: How can a skilled person turn their capability into reliable, trusted, sustainable economic opportunity?

---

## 4. Product Thesis

The winning service marketplace won't simply have the largest provider directory. It will have the best system for converting:

> Need → Understanding → Matching → Trust → Booking → Payment → Execution → Completion → Reputation → Repeat

The supply-side equivalent:

> Skill → Verification → Activation → Job → Performance → Reputation → More Jobs → More Income → Development

Together these form a two-sided flywheel — but the MVP tests only the first, smallest links of each chain.

---

## 5. Target Users & Market

**Primary Beachhead (confirmed)**
People with no established local trusted-artisan network — renters, new relocators to Abuja, and tourists/visitors. The shared trait is absence of a local trust network, not the renter/tourist label itself.

**Full User Universe (for later, not MVP)**
- Customers: homeowners, tenants, professionals, students, families, landlords, expatriates, busy executives
- Providers: plumbers, electricians, cleaners, AC/generator/solar technicians, handymen, movers, mechanics
- Future institutional customers (ServLink Business): offices, hotels, estates, schools, hospitals, NGOs, government institutions

**Launch Zones**
Gwarinpa, Wuse 2, Jabi, Maitama, Asokoro — chosen for marketplace liquidity, and validated by real estate data showing young professionals and civil servants concentrated in exactly these areas.

**Initial Categories**
Plumbing, Electrical, AC/HVAC, Cleaning, Generator/Solar, Handyman, Moving, Auto assistance — chosen for frequency, urgency, and repeat potential. To be validated against actual demand.

---

## 6. Competitive Landscape & Differentiation

| Platform | Strength | ServLink's Response |
|---|---|---|
| CitiTasker | Local professional directory | Execution, not just discovery |
| Hustlam | Bidding, protected payment, active in Abuja | AI matching over price competition |
| Kwikly | Scale (claims 50K+ providers) | Trust + operational data over raw scale |
| TrustAm | WhatsApp AI discovery, escrow, tracking | Full transaction lifecycle |
| Near-U | AI matching, verified pros, proximity, escrow | Execution management beyond matching |
| Vendoh | Voice-powered discovery (launching) | Voice + deeper execution |
| MyFixam | In-app payment, live tracking | Recourse/rework guarantee |
| Worker.ng | Free directory | Verified, accountable matching |
| OgaBuild | Reliability scores, staged payment | Abuja-specific density + voice-first |
| Porchplus | Artisans for renters specifically | Broader category set + AI concierge |

**Strategic implication:** none of AI, verification, WhatsApp, or escrow are differentiators anymore — they're table stakes. ServLink must compete on the quality of the entire execution system, not any single feature.

---

## 7. Product Principles & The ServLink Rule

**Ten Product Principles**
1. Solve the customer's problem, not the customer's interface problem
2. Trust is a system, not a badge
3. AI should reduce work, not create novelty
4. Every feature must contribute to successful service completion
5. Do not launch complexity before proving demand
6. Providers are partners in the ecosystem, not inventory
7. Never sacrifice marketplace trust for short-term revenue
8. Start concentrated before becoming broad
9. Use data to improve decisions, not merely produce dashboards
10. Build infrastructure that can survive beyond one interface

**The ServLink Rule** — before adding any future feature, ask:
1. Does it help a customer get a service completed?
2. Does it help a provider deliver better?
3. Does it increase trust?
4. Does it improve matching?
5. Does it improve transaction success?
6. Does it increase repeat usage?
7. Does it improve provider income/productivity?
8. Does it create a defensible capability?
9. Does it improve the economics of the marketplace?

**If the answer is none — it probably doesn't belong yet.**

---

# PART B — MVP (BUILDING NOW)
### *Everything in this part is what you are actually building*

## 8. MVP Scope

Defined using MoSCoW — sorting every possible feature by how essential it is to testing whether the core idea works at all.

**Design Principle (PRODUCT DECISION): App-centric, Telegram as one adapter.**
The product is the **ServLink App + execution core** (Request → Match → Confirm → Follow-up + central log). The App is the home for requesting, status, history, and trust. Telegram — plus later WhatsApp, web widget, voice — are interaction mediums (adapters) feeding a normalized request (`what + where + when + contact`) into the same core and returning confirmations/follow-ups. No channel owns the logic, per Principle 10 (infrastructure that survives beyond one interface) and Section 18 (ServLink is not merely a chatbot).

| Priority | Features |
|---|---|
| **Must Have (Day 1)** | Execution core: normalized intake + zone capture, 5–10 vetted providers, manual matching, central request log, post-job follow-up. **Consumer App (minimal):** submit request, see match confirmation (who's coming), confirm completion. **Telegram adapter (parity):** plain-language request + location in chat, receive the same confirmation/follow-up. Same core, same log, either entry point |
| **Should Have (soon after)** | Structured provider list decoupled from App/channels; rule-based matching service (category + zone → suggest a provider) shared by App + adapters; App job tracking/history |
| **Could Have (Qubators Weeks 2–4)** | Shared AI understanding layer across App + channels; visible rating/reputation in App; formal rework/callback flow in App + Telegram |
| **Won't Have Yet** | In-app payments; voice interface (later adapter); live tracking; property-manager features; more than one city |

---

## 9. What Is NOT MVP

Explicitly excluded until the MVP proves itself:
- Full ServLink Academy
- International operations
- Complex subscriptions or financial products (loans, insurance)
- Advanced predictive maintenance
- Autonomous AI decisions (banning providers, withholding payment, adjudicating disputes)
- Broad marketplace categories beyond the initial 5–8
- Loyalty systems or gamification

---

## 10. Customer & Provider Journey — MVP vs. Full Vision

**MVP Journey (confirmed, App-centric)**
Request → Match → Confirm → Follow-up. Customer requests in the App or via Telegram; the core normalizes it, matches to a vetted provider, confirms who's coming (visible in App + echoed on originating channel); after the job, the customer is asked whether it was done well.

**Full Long-Term Customer Journey (future vision, not MVP)**
Tell → Understand → Clarify → Match → Compare → Book → Pay → Execute → Track → Complete → Review → Remember. The "Remember" stage — recording service history ("Your AC was serviced 14 March") — is what eventually enables recurring/preventive service relationships.

**Full Long-Term Provider Journey (future vision, not MVP)**
Discover → Register → Build Profile → Verify → Activate → Receive Opportunities → Accept → Execute → Complete → Get Paid → Build Reputation.

---

## 11. Validation Strategy & Success Definition

The MVP is validated against the first 10–15 real requests from real people — not test requests from friends who already trust the founder:
- At least 70% matched to a provider within 2 hours
- At least 70% of matched jobs actually completed
- At least 70% of customers confirm the work was done properly
- At least 3 people would use it again

These are placeholders, deliberately set before results exist so they can't be quietly moved later. Broader success signals to watch for as volume grows: real demand, real supply, successful matching, execution, sufficient trust to transact, positive unit economics, and repeat usage.

---

## 12. KPIs to Track from Day One

| Category | Metrics |
|---|---|
| Marketplace | Service requests, active customers, active providers, completed jobs, GMV, average order value |
| Demand | Request rate, match rate, booking rate, completion rate, repeat rate |
| Supply | Active providers, acceptance rate, cancellation rate, response time, earnings/provider |
| Trust | Verification completion, dispute rate, refund rate, customer rating |
| Operations | Time to match, time to acceptance, time to completion, failed transactions |

---

# PART C — LONG-TERM VISION (PRODUCT BIBLE)
### *Nothing in this part is built now — reference for direction only*

## 13. Trust Architecture & Provider Tiers

Trust is a system, not one feature — built progressively through identity, capability, performance, transaction, and reputation signals.

**Provider Tiers**
- **Basic** — identity/account established, limited trust signals
- **Verified** — identity and required checks completed
- **Professional** — verified qualifications, strong job history, low cancellation, high satisfaction

ServLink must not imply a "Professional" tag guarantees superiority — it represents documented platform criteria, transparently explained to providers.

**Provider Reliability Score (weighting)**

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

## 14. Business Model & Revenue Streams

Not all revenue streams launch at once — the MVP is pre-revenue by design.

| Revenue Stream | Description |
|---|---|
| Transaction commission | Primary stream — ~10–12% of job value (planning assumption) |
| Customer service/protection fee | ~2–3% of job value, itemized, never hidden |
| Provider subscription | Optional premium tools (later) |
| Premium visibility | Legitimate promotional placement, subject to fairness rules (later) |
| ServLink Academy | Training/certification fees (later) |
| B2B subscriptions | Recurring service-management contracts (later) |

**Revenue principle:** ServLink earns when value is successfully created — not by simply making transactions more expensive. A companion Unit Economics & Growth Scenario spreadsheet models contribution per job, break-even volume, and TAM/SAM/SOM in detail.

---

## 15. ServLink Academy & ServLink Business

**ServLink Academy (later — not MVP)**
Converts learning into verified economic opportunity: Learn → Assess → Verify → Apprentice → Activate → Receive Jobs → Earn → Build Reputation → Advance. A strategic extension, not a launch requirement — turns ServLink from consuming existing supply into creating future supply.

**ServLink Business (later — not MVP)**
B2B workflow: Business Request → Ticket → Diagnosis → Provider Assignment → Approval → Execution → Completion → Invoice → Report → Service History. Potential customers: offices, hotels, estates, schools, property managers.

---

## 16. Product Roadmap & Maturity Model

| Phase | Objective |
|---|---|
| 0 — Discovery | Validate customer/provider problems, categories, willingness to transact, pricing, trust barriers |
| 1 — Concierge MVP | Prove customers will use ServLink — minimal Consumer App + Telegram as parallel entry points, human-assisted matching behind one shared core — **this is where you are now** |
| 2 — Marketplace MVP | Prove repeatable transactions with digital workflows, App as home (tracking/history) |
| 3 — Intelligent Marketplace | AI-assisted intake, classification, matching, support |
| 4 — Service Execution Platform | Add tracking, recurring services, service history, advanced reputation, B2B |
| 5 — Skills Economy | ServLink Academy — build supply, not just match existing supply |
| 6 — Service Infrastructure | APIs, B2B integrations, property systems, enterprise services |

**Product Maturity Levels**
Directory → Marketplace → Trusted Marketplace → Intelligent Marketplace → Service Execution Platform → Skills-to-Income Ecosystem → Service Infrastructure. ServLink should not pretend to be Level 7 while building Level 1.

---

## 17. Marketplace Mechanics

**The Flywheel**
More customers → more requests → more provider opportunities → more providers → better availability → more completed jobs → more performance data → better matching → higher trust → more customers (repeat).

**Liquidity**
The biggest risk isn't technology — it's liquidity. If a customer requests a plumber and none is available, ServLink fails regardless of interface quality. Supply density in a small area matters more than thousands of providers spread thin across Nigeria.

**Leakage**
Risk: customer and provider meet through ServLink, then transact directly going forward. The countermeasure isn't blocking people from leaving — it's making staying on ServLink more valuable than leaving (service history, warranty/support, recurring bookings, dispute protection).

**Retention**
Service history, favourite providers, recurring bookings, and proactive reminders ("Your AC was last serviced 5 months ago — schedule maintenance?") turn one-off transactions into a relationship.

---

## 18. Anti-Features & What ServLink Is Not

**Actively avoid**
- Provider spam — customers shouldn't receive dozens of irrelevant offers
- Fake reviews — tied to legitimate transactions only
- Pay-to-win ranking — payment shouldn't override suitability and trust
- Hidden charges — customers understand relevant costs upfront
- Artificial urgency — never manufactured to increase revenue

**ServLink is not**
An ordinary classifieds site, a social network, merely an artisan directory, merely a chatbot, a bidding website, a training company, a bank, an insurance company, or a staffing agency by default. Its centre remains service execution.

---

## 19. Major Risks & Kill Criteria

| Risk | Response |
|---|---|
| Competition already offers table-stakes features | Differentiate through execution, performance intelligence, recurring relationships, skills development |
| Chicken-and-egg (no customers without providers, vice versa) | Start geographically concentrated, manually recruit supply |
| Poor provider quality | Verification + performance monitoring + progressive tiers |
| Off-platform leakage | Make on-platform value genuinely useful |
| Customer distrust | Verification + transparent transactions + clear dispute process |
| Low margins | Measure contribution economics from day one |
| AI overengineering | Use AI only where it produces measurable value |
| Regulatory exposure | Legal/compliance review before payment, employment, or high-risk service expansion |

---

## 20. North Star Metric

> **Successful Service Completions**

Not downloads. Not registered users. Not AI conversations. Not provider registrations. A service marketplace creates value only when a real customer's need is actually resolved.

*Secondary North Star (deeper, for later): Successful repeat service relationships — a customer who trusts ServLink repeatedly is worth substantially more than one who completes a single transaction.*

---

## 21. Data, Privacy & Safety

ServLink processes names, phone numbers, emails, GPS locations, service history, payment references, and provider identity data (NIN + government ID photos). This requires data minimization, explicit consent, access controls, retention rules, and Nigerian data-protection compliance (NDPA 2023, NDPC) — designed in from the start, not retrofitted.

**Data governance rules (PRODUCT DECISIONS, enforced in code):**
- **Minimization:** collect only what a flow needs (`what + where + when + contact` for requests; NIN + one ID photo for providers — nothing more).
- **Consent:** every registration states plainly what is collected and why, and requires an explicit YES before NIN/ID capture. Consent timestamp is stored with the application.
- **NIN handling:** raw NINs are write-only — storable, never returned by any API. Only the last 4 digits surface for review. Licensed-vendor verification upgrades Basic → Verified; format + photo checks alone never imply identity certainty.
- **ID photos:** held in the Telegram vault during pilot (no local copies); R2 migration must preserve access-control, never public URLs.
- **Retention:** request logs persist for marketplace integrity; PII (phone, email, ID refs) deletable on verified request; raw NINs purged after verification decision + 30 days.
- **Access:** console has no auth gate yet (localhost pilot) — gating is a launch blocker, not a nice-to-have (see Phase 9).

**AI governance (applies to the Groq assistant + future matching AI):**
- Human-in-the-loop: the assistant proposes, the customer confirms (YES gate); matching suggests, humans can always override; the founder approves providers the automation can't.
- No autonomous penalties: the system never bans, withholds pay, or adjudicates disputes alone.
- Transparency: customers always see *who* is assigned and *why* (distance, tier, rating shown, not hidden scores).
- Safety is a first-class concern given real-world services: high-risk categories (electrical, gas, structural, major mechanical work) require Verified tier minimum, and ServLink must never imply it guarantees physical safety merely because a provider is verified.

**Pilot KYC position (PRODUCT DECISION):** true NIN validation needs a licensed vendor. For the 10–15 job pilot, verification = NIN format check + ID photo + human review (call references) — free, and proportionate to pilot risk. A vendor API (see ADR-012) enters before public launch, not after an incident.

---

## 22. Global Expansion Model

Abuja → Lagos → other Nigerian cities → selected African cities → global — sequenced by validated economics and supply-demand density, not ambition. Expansion should mean locally-adapted operating systems (payment, regulation, labour structure, identity verification all vary by country), not simply translating a Nigerian app.

---

## 23. Product Decision Framework

Every major decision — and every future one — should be classified as one of four types, so the product stays coherent rather than becoming a collection of exciting ideas:

| Type | Meaning |
|---|---|
| FACT | Supported by market evidence, customer research, or measured platform data |
| HYPOTHESIS | An assumption that requires validation |
| PRODUCT DECISION | A deliberate choice made by the team |
| OUT OF SCOPE | A capability intentionally excluded from the current stage |

For example: the target user and MVP scope in Part B are PRODUCT DECISIONS, made collaboratively and confirmed. The commission rate and CAC in the Unit Economics model are HYPOTHESES awaiting real data. Everything in Part C is currently OUT OF SCOPE by design.

---

## 24. Glossary

| Term | Meaning |
|---|---|
| MVP | Minimum Viable Product — the smallest version that can genuinely test whether the idea works |
| MoSCoW | Prioritization method: Must have, Should have, Could have, Won't have (yet) |
| GMV | Gross Merchandise Value — total value of transactions flowing through the platform |
| CAC | Customer Acquisition Cost |
| LTV | Lifetime Value — total contribution a customer generates over time |
| Fill Rate | Percentage of legitimate service requests successfully fulfilled |
| Contribution margin | Revenue left per transaction after direct/variable costs |
| Beachhead | The first, narrow customer segment a product focuses on before expanding |
| Liquidity (marketplace) | Whether enough supply and demand exist in the same place to make matching work |
| Leakage | Transactions that move off-platform after the introduction, earning the platform nothing |

---

*This is a living document. Part A and B should be updated as real MVP results come in. Part C should only move into Part B when a Part A/B milestone has actually earned it — per the ServLink Rule in Section 7.*
