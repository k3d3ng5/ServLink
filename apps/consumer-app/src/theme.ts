// ServLink luxury theme — source: Stitch direction (emerald / champagne / ivory).
//!Keep in sync with packages/design-tokens/tokens.json.
export const colors = {
  brand: "#0B3D2E",
  brandDark: "#062A20",
  accent: "#C9A227",
  accentSoft: "#F5ECD4",
  ink: "#14201C",
  paper: "#FAF7F0",
  muted: "#6B7280",
  success: "#1E7A4F",
  warning: "#C9A227",
  danger: "#B4433A",
  border: "#E7DFC9",
  card: "#FFFFFF",
} as const;

export const radii = {
  card: 16,
  pill: 20,
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
