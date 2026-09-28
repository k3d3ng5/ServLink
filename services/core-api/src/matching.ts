import { db } from "./db.js";
import { hasCoords, haversineKm } from "./geo.js";

export interface Suggestion {
  providerId: string;
  name: string;
  tier: string;
  score: number;
  distanceKm: number | null;
  reasons: string[];
}

const TIER_SCORE: Record<string, number> = {
  Professional: 30,
  Verified: 20,
  Basic: 10,
};

// Rule-based matching v2 (GPS-first):
// - Both sides have coords -> rank by distance (closest wins), outside service
//   radius is excluded. Tier/verification/jobs break ties.
// - Either side missing coords -> fall back to zone match (flagged in reasons).
export async function suggestProviders(requestId: string, limit = 5): Promise<Suggestion[]> {
  const req = await db.serviceRequest.findUnique({ where: { id: requestId } });
  if (!req) throw Object.assign(new Error("request not found"), { status: 404 });

  const reqGeo = hasCoords(req) ? { latitude: req.latitude!, longitude: req.longitude! } : null;
  // Only online providers are offered jobs (availability gate).
  const providers = await db.provider.findMany({
    where: { isOnline: true },
    include: { jobs: true },
  });
  const ranked: Suggestion[] = [];

  for (const p of providers) {
    const cats: string[] = JSON.parse(p.categories || "[]");
    const zones: string[] = JSON.parse(p.zones || "[]");
    if (req.categoryId && !cats.includes(req.categoryId)) continue;

    let distanceKm: number | null = null;
    const reasons: string[] = [];
    if (reqGeo && hasCoords(p)) {
      distanceKm = haversineKm(reqGeo, { latitude: p.latitude!, longitude: p.longitude! });
      if (distanceKm > p.serviceRadiusKm) continue; // out of service area
      reasons.push(`${distanceKm.toFixed(1)} km away`);
    } else {
      if (req.zoneId !== "general" && !zones.includes(req.zoneId)) continue; // zone fallback
      reasons.push(
        req.zoneId === "general" ? "area-wide match (no GPS)" : `serves ${req.zoneId} (area match — no GPS)`
      );
    }

    // Proximity is the primary signal (0–100), trust/experience break ties.
    let score = distanceKm === null ? 50 : Math.max(0, 100 - distanceKm);
    score += TIER_SCORE[p.tier] ?? 0;
    reasons.push(`tier ${p.tier}`);
    if (p.verificationStatus !== "pending") {
      score += 10;
      reasons.push("verified");
    }
    const completed = p.jobs.length;
    score += Math.min(completed, 10);
    if (completed > 0) reasons.push(`${completed} past job${completed === 1 ? "" : "s"}`);

    ranked.push({ providerId: p.id, name: p.name, tier: p.tier, score, distanceKm, reasons });
  }

  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}
