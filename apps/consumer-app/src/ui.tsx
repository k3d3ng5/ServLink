import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "./theme";

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink },
  sub: { fontSize: 14, color: colors.muted },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, gap: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
  },
  error: { color: colors.danger, fontSize: 13 },
});

export function Btn({ label, onPress, tone = "brand" }: { label: string; onPress: () => void; tone?: "brand" | "ghost" | "danger" }) {
  const bg = tone === "brand" ? colors.brand : tone === "danger" ? colors.danger : "#fff";
  const fg = tone === "ghost" ? colors.brand : "#fff";
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: bg,
        borderRadius: 10,
        padding: 14,
        alignItems: "center",
        borderWidth: tone === "ghost" ? 1 : 0,
        borderColor: colors.brand,
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
        multiline={multiline}
      />
    </View>
  );
}
