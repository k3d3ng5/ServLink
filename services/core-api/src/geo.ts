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
