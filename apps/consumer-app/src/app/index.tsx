import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { session } from "../session";
import { Btn, Field, s } from "../ui";

export default function Home() {
  const [email, setEmail] = useState(session.email);
  const [err, setErr] = useState("");

  function go(path: "/request" | "/jobs") {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErr("Enter a valid email — it's how we find your jobs.");
      return;
    }
    session.email = email.trim();
    router.push(path);
  }

  return (
    <View style={s.screen}>
      <Text style={s.title}>Tell ServLink.{"\n"}We&apos;ll help get it done.</Text>
      <Text style={s.sub}>Plumbing, electrical, AC, cleaning & more across Abuja.</Text>
      <Field label="Your email" value={email} onChange={(t) => { setEmail(t); setErr(""); }} placeholder="you@example.com" />
      {err ? <Text style={s.error}>{err}</Text> : null}
      <Btn label="🛠 New service request" onPress={() => go("/request")} />
      <Btn label="📦 My jobs" onPress={() => go("/jobs")} tone="ghost" />
    </View>
  );
}
