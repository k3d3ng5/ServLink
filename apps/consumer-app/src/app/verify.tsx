import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { api } from "../../lib/api";
import { session } from "../../session";
import { colors } from "../../theme";
import { Btn, s } from "../../ui";

// Stitch luxury login: deep emerald stage, ivory card, six digit boxes.
export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");

  function set(i: number, v: string) {
    const clean = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, j) => (j === i ? clean : x)));
    setErr("");
  }

  async function verify() {
    const otp = digits.join("");
    if (otp.length < 4) {
      setErr("Type the code from your email.");
      return;
    }
    try {
      await api.verifyOtp(email, otp);
      session.email = email;
      router.replace("/");
    } catch {
      setErr("Wrong or expired code — try again.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.primaryContainer }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 12 }}>
        <Text style={{ color: colors.goldSoft, fontSize: 11, letterSpacing: 3, fontWeight: "700", textAlign: "center" }}>
          SERVLINK ABUJA
        </Text>
        <Text style={[s.title, { color: "#fff", textAlign: "center" }]}>Enter your code</Text>
        <Text style={{ color: colors.goldSoft, textAlign: "center" }}>Sent to {email}</Text>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 8 }}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              style={{
                width: 46, height: 56, borderRadius: 12, backgroundColor: "#fff",
                textAlign: "center", fontSize: 22, fontWeight: "800", color: colors.ink,
                borderWidth: 1, borderColor: d ? colors.accent : colors.border,
              }}
              value={d}
              onChangeText={(v) => set(i, v)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>
        {err ? <Text style={{ color: "#F5C6C0", textAlign: "center" }}>{err}</Text> : null}
        <Pressable
          onPress={verify}
          style={{ backgroundColor: colors.accent, borderRadius: 12, padding: 15, alignItems: "center", marginTop: 8 }}
        >
          <Text style={{ color: colors.ink, fontWeight: "800", fontSize: 16 }}>Verify & log in</Text>
        </Pressable>
      </View>
    </View>
  );
}
