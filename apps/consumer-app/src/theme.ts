// ServLink theme — extracted from Stitch luxury screens (Artisan Guild, Concierge
// Desk, Live Dispatch Tracker, Privilege Profile).
export const colors = {
  // Stitch primaries
  primary: "#00261b",
  primaryContainer: "#0b3d2e",
  tertiaryContainer: "#1d3b30",
  // Stitch golds
  gold: "#755b00",
  goldSoft: "#ffe08e",
  goldBright: "#fed255",
  accent: "#C9A227",
  // Stitch surfaces
  surface: "#fcf9f2",
  surfaceLow: "#f6f3ec",
  surfaceContainer: "#f0eee7",
  surfaceHigh: "#ebe8e1",
  paper: "#FAF7F0",
  card: "#FFFFFF",
  // Ink + support
  ink: "#1c1c18",
  onPrimary: "#ffffff",
  muted: "#414944",
  outline: "#717974",
  success: "#1E7A4F",
  danger: "#ba1a1a",
  border: "#E7DFC9",
  // Legacy aliases (kept compiling during migration)
  brand: "#0b3d2e",
  brandDark: "#00261b",
  accentSoft: "#F5ECD4",
} as const;

export const radii = {
  card: 12,
  pill: 999,
  button: 12,
} as const;

export const CATEGORIES = [
  ["Plumbing", "plumbing"],
  ["Electrical", "electrical"],
  ["AC / HVAC", "ac-hvac"],
  ["Cleaning", "cleaning"],
  ["Generator / Solar", "generator-solar"],
  ["Handyman", "handyman"],
  ["Moving", "moving"],
  ["Auto assistance", "auto-assistance"],
] as const;

export const ZONES = [
  ["Gwarinpa", "gwarinpa"],
  ["Wuse 2", "wuse-2"],
  ["Jabi", "jabi"],
  ["Maitama", "maitama"],
  ["Asokoro", "asokoro"],
] as const;
