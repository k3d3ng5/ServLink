import { db } from "./db.js";

export interface Suggestion {
  providerId: string;
  name: string;
  tier: string;
  score: number;
  reasons: string[];
}

const TIER_SCORE: Record<string, number> = {
  Professional: 30,
  Verified: 20,
  Basic: 10,
};

// Rule-based matching v1 (Phase 7): eligible = serves category + zone.
// Ranked by tier + verification. Manual override always allowed (logged at match).
export async function suggestProviders(requestId: string, limit = 5): Promise<Suggestion[]> {
  const req = await db.serviceRequest.findUnique({ where: { id: requestId } });
  if (!req) throw Object.assign(new Error("request not found"), { status: 404 });

  const providers = await db.provider.findMany({ include: { jobs: true } });
  const ranked: Suggestion[] = [];

  for (const p of providers) {
    const cats: string[] = JSON.parse(p.categories || "[]");
    const zones: string[] = JSON.parse(p.zones || "[]");
    if (req.categoryId && !cats.includes(req.categoryId)) continue;
    if (!zones.includes(req.zoneId)) continue;

    const reasons = [`serves ${req.zoneId}`];
    let score = TIER_SCORE[p.tier] ?? 0;
    reasons.push(`tier ${p.tier}`);
    if (p.verificationStatus !== "pending") {
      score += 10;
      reasons.push("verified");
    }
    const completed = p.jobs.length;
    score += Math.min(completed, 10);
    if (completed > 0) reasons.push(`${completed} past job${completed === 1 ? "" : "s"}`);

    ranked.push({ providerId: p.id, name: p.name, tier: p.tier, score, reasons });
  }

  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}
