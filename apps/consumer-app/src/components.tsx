import { Text, View } from "react-native";
import { colors } from "./theme";

const STATE_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  REQUESTED: { bg: "#FEF3C7", fg: "#92400E", label: "Requested" },
  MATCHED: { bg: "#DBEAFE", fg: "#1E40AF", label: "Matched" },
  CONFIRMED: { bg: "#E0E7FF", fg: "#3730A3", label: "Confirmed" },
  IN_PROGRESS: { bg: "#FFEDD5", fg: "#9A3412", label: "In progress" },
  DONE_PENDING_CONFIRM: { bg: "#F3E8FF", fg: "#6B21A8", label: "Awaiting review" },
  FOLLOW_UP_SENT: { bg: "#F3E8FF", fg: "#6B21A8", label: "Awaiting review" },
  COMPLETED: { bg: "#D1FAE5", fg: "#065F46", label: "Completed" },
  CANCELLED: { bg: "#F3F4F6", fg: "#6B7280", label: "Cancelled" },
  REWORK_REQUESTED: { bg: "#FEE2E2", fg: "#991B1B", label: "Rework" },
  REMATCHED: { bg: "#DBEAFE", fg: "#1E40AF", label: "Rematched" },
};

export function StatusChip({ status }: { status: string }) {
  const c = STATE_COLORS[status] ?? { bg: "#F3F4F6", fg: colors.muted, label: status };
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10, alignSelf: "flex-start" }}>
      <Text style={{ color: c.fg, fontSize: 12, fontWeight: "700" }}>{c.label}</Text>
    </View>
  );
}

export function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ alignItems: "center", gap: 6, paddingVertical: 32 }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#EEF2F1", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 24 }}>🛠</Text>
      </View>
      <Text style={{ fontWeight: "800", fontSize: 16, color: colors.ink }}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: "center", fontSize: 13 }}>{sub}</Text>
    </View>
  );
}
