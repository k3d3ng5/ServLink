// ServLink corporate theme — premium technology brand.
// Primary #0556ed, white/light surfaces, executive Inter typography.
// Understated, intelligent, credible, contemporary. No gradients, no noise.
export const colors = {
  // Brand
  brand: "#0556ed",
  brandDark: "#0A1633",
  primaryContainer: "#0556ed",
  tertiaryContainer: "#0A1633",
  // Accent (restrained blue scale)
  accent: "#4D84F5",
  accentSoft: "#E8EFFD",
  goldSoft: "#E8EFFD",
  gold: "#0556ed",
  // Surfaces
  surface: "#FFFFFF",
  surfaceLow: "#F6F8FC",
  surfaceContainer: "#EEF2F9",
  surfaceHigh: "#E4EAF4",
  paper: "#FFFFFF",
  card: "#FFFFFF",
  // Ink + support
  ink: "#0A1633",
  onPrimary: "#ffffff",
  muted: "#5B6478",
  outline: "#C6CEDD",
  success: "#12805C",
  danger: "#C03636",
  border: "#E4EAF4",
} as const;

export const radii = {
  card: 12,
  pill: 999,
  button: 10,
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
