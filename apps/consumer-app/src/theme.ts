// ServLink palette — source of truth is packages/design-tokens/tokens.json.
export const colors = {
  brand: "#0B6B4F",
  brandDark: "#084A37",
  accent: "#F2A007",
  ink: "#14201C",
  paper: "#FFFFFF",
  muted: "#6B7280",
  success: "#1E9E6A",
  warning: "#E8930C",
  danger: "#D64545",
  border: "#E5E7EB",
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
