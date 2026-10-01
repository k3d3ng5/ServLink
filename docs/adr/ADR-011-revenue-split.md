# ADR-011 — Revenue split & materials money (pilot)

- Status: Accepted (pilot) — review at 50 paid jobs.
- Context: Every paid job must divide cleanly between provider, platform, and processing costs; repair jobs often need materials bought before work starts.
- Decision:
  1. **Split: 90% provider / 10% platform** of the collected total. The platform absorbs Paystack processing (~1.5%) and all rework costs from its share. Rationale: supply is the scarce side at pilot stage; generosity now buys loyalty and referrals. Revisit (toward 85/12/3 with a warranty pool) only with real margin data.
  2. **Automation later:** Paystack Subaccounts + split payments move the split at collection time (no manual payouts). Until live keys + volume, settlement is a weekly console report + manual transfer.
  3. **Materials:** quoted as a separate line (`materialsKobo` + `materialsNote`), approved inside the same customer Confirm as labor. Default: materials are **included in the single Paystack collection** after completion; for jobs where parts must be bought first, the provider flags it in the note and the concierge collects a **materials advance** (separate quote → pay link) before work starts. Platform never floats materials money.
- Consequences: quote schema carries the breakdown; receipts itemize it; analytics will track average labor vs materials for the 50-job review.
