import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { api } from "../lib/api";
import { session } from "../session";
import { Btn, Field, s, Backdrop } from "../ui";
import { colors } from "../theme";

function Menu({ email }: { email: string }) {
  const [isPro, setIsPro] = useState(false);
  useFocusEffect(
    useCallback(() => {
      api
        .proMe()
        .then(() => setIsPro(true))
        .catch(() => setIsPro(false));
    }, [])
  );
  return (
    <View style={s.screen}>
      <Text style={s.title}>Tell ServLink.{"\n"}We&apos;ll help get it done.</Text>
      <Text style={s.sub}>Logged in as {email}</Text>
      <Link href="/chat" asChild><Btn label="💬 Chat with ServLink" onPress={() => {}} /></Link>
      <Link href="/request" asChild><Btn label="🛠 New service request (form)" onPress={() => {}} tone="ghost" /></Link>
      <Link href="/jobs" asChild><Btn label="📦 My jobs" onPress={() => {}} tone="ghost" /></Link>
      {isPro && (
        <Link href="/pro" asChild><Btn label="🧰 ServLink Pro" onPress={() => {}} tone="ghost" /></Link>
      )}
    </View>
  );
}

export default function Home() {
  const [email, setEmail] = useState(session.email);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  async function login() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErr("Enter a valid email.");
      return;
    }
    setSending(true);
    setErr("");
    try {
      await api.sendOtp(email.trim().toLowerCase());
      router.push({ pathname: "/verify", params: { email: email.trim().toLowerCase() } });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (session.email) {
    return <Menu email={session.email} />;
  }

  return (
    <Backdrop>
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 12, backgroundColor: "transparent" }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", alignSelf: "center" }}>
          <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800" }}>S</Text>
        </View>
        <Text style={[s.title, { textAlign: "center" }]}>Trusted home services, perfected.</Text>
        <Text style={{ color: colors.muted, textAlign: "center" }}>Log in with your email — we&apos;ll send a one-time code.</Text>
        <Field label="" value={email} onChange={(t) => { setEmail(t); setErr(""); }} placeholder="you@example.com" />
        {err ? <Text style={s.error}>{err}</Text> : null}
        <Btn label={sending ? "Sending…" : "Send login code"} onPress={login} />
      </View>
    </View>
    </Backdrop>
  );
}
