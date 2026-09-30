import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii } from "./theme";

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink, fontFamily: "PlayfairDisplay_700Bold" },
  sub: { fontSize: 14, color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 16,
    gap: 6,
    shadowColor: "#0B3D2E",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.button,
    padding: 14,
    fontSize: 16,
    color: colors.ink,
  },
  error: { color: colors.danger, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.accent, opacity: 0.4 },
});

export function Btn({ label, onPress, tone = "brand" }: { label: string; onPress: () => void; tone?: "brand" | "gold" | "ghost" | "danger" }) {
  const bg =
    tone === "brand" ? colors.brand : tone === "gold" ? colors.accent : tone === "danger" ? colors.danger : colors.card;
  const fg = tone === "ghost" ? colors.brand : tone === "gold" ? colors.ink : "#fff";
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: bg,
        borderRadius: radii.button,
        padding: 15,
        alignItems: "center",
        borderWidth: tone === "ghost" ? 1 : 0,
        borderColor: colors.accent,
        minHeight: 52,
        justifyContent: "center",
      }}
    >
      <Text style={{ color: fg, fontWeight: "700", fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChange, placeholder, multiline }: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "700", color: colors.ink }}>{label}</Text>
      <TextInput
        style={[s.input, multiline && { minHeight: 80, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
      />
    </View>
  );
}
