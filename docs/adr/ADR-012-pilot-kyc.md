# ADR-012 — Pilot KYC: free, human-led, vendor later

- Status: Accepted (pilot) — vendor integration is a launch blocker for public release.
- Context: True NIN validation requires a NIMC-licensed vendor (paid per check).
  For a 10–15 job pilot, per-check fees buy nothing a disciplined human review
  doesn't already cover — and "free production NIN verification" doesn't exist.
- Decision (three layers, cheapest first):
  1. **Automated (free, built):** 11-digit NIN format check + mandatory government
     ID photo (NIN slip, voter's card, driver's license, passport) + phone
     validity. Both present → auto-approve to Basic. Raw NIN write-only,
     last-4 only for review.
  2. **Human (free, operational):** console review of ID photo + reference call
     before any provider takes a high-risk job. Recorded in the audit log.
  3. **Vendor (paid, at launch):** shortlist — Smile Identity (free sandbox now,
     pay per verification at launch; confirm current pricing before committing),
     Dojah (test credits reported — confirm before depending on it),
     YouVerify/VerifyMe/Prembly (compare per-check NIN pricing).
     **Verify all free-tier claims directly before building on them.**
- Consequences: vendor API plugs into the existing approve path (Basic →
  Verified); no intake changes needed. Retention rule (PRD Sec 21): raw NINs
  purged 30 days after the verification decision.
