// Haversine distance — closest provider wins (Phase: GPS matching).
export interface LatLng {
  latitude: number;
  longitude: number;
}

const R_KM = 6371;

function rad(d: number): number {
  return (d * Math.PI) / 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.sqrt(s));
}

export function hasCoords(o: { latitude?: number | null; longitude?: number | null }): o is LatLng & object {
  return typeof o.latitude === "number" && typeof o.longitude === "number";
}

// Launch-zone centroids (approx, Abuja) — intake auto-zones GPS requests.
// No GPS -> "general" (matching goes GPS-blind across categories, ranked by trust).
export const ZONE_CENTROIDS: Record<string, LatLng> = {
  gwarinpa: { latitude: 9.1072, longitude: 7.4117 },
  "wuse-2": { latitude: 9.082, longitude: 7.483 },
  jabi: { latitude: 9.064, longitude: 7.424 },
  maitama: { latitude: 9.095, longitude: 7.495 },
  asokoro: { latitude: 9.052, longitude: 7.53 },
};

export function nearestZone(p: LatLng): string {
  let best = "general";
  let bestD = Infinity;
  for (const [zone, c] of Object.entries(ZONE_CENTROIDS)) {
    const d = haversineKm(p, c);
    if (d < bestD) {
      bestD = d;
      best = zone;
    }
  }
  return best;
}
