import { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { api } from "../lib/api";
import { session } from "../session";
import { Btn, Field, s } from "../ui";

export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  async function verify() {
    const otp = code.replace(/\D/g, "");
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
    <View style={s.screen}>
      <Text style={s.title}>Enter your code</Text>
      <Text style={s.sub}>Sent to {email}</Text>
      <Field label="6-digit code" value={code} onChange={(t) => { setCode(t); setErr(""); }} placeholder="123456" />
      {err ? <Text style={s.error}>{err}</Text> : null}
      <Btn label="Verify & log in" onPress={verify} />
    </View>
  );
}
