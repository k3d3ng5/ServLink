import { useCallback, useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { api } from "../lib/api";
import { session } from "../session";
import { Btn, Field, s, Backdrop } from "../ui";
import { colors } from "../theme";
import { useEffect } from "react";

// Stitch login: header bar, centered emblem, email+inline send, OTP boxes,
// social buttons (wired when OAuth creds exist), trust footer.
export default function Home() {
  const [email, setEmail] = useState(session.email);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(secs - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  async function login(send = true) {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErr("Enter a valid email.");
      return;
    }
    if (send) {
      setSending(true);
      setErr("");
      try {
        await api.sendOtp(email.trim().toLowerCase());
        setSecs(40);
      } catch (e) {
        setErr((e as Error).message);
        setSending(false);
        return;
      }
      setSending(false);
    }
    router.push({ pathname: "/verify", params: { email: email.trim().toLowerCase() } });
  }

  if (session.email) {
    return <Menu email={session.email} />;
  }

  return (
    <Backdrop>
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12 }}>
        <Text style={{ fontSize: 20, color: colors.ink }}>←</Text>
        <Text style={{ fontWeight: "800", fontSize: 18, color: colors.ink }}>Login</Text>
        <Text style={{ fontSize: 20, color: colors.ink }}>?</Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 10, backgroundColor: "transparent" }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", alignSelf: "center" }}>
          <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800" }}>S</Text>
        </View>
        <View style={{ alignSelf: "center", backgroundColor: "#EDEEF2", borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 2, color: colors.muted }}>SERVLINK ABUJA</Text>
        </View>
        <Text style={[s.title, { textAlign: "center", fontSize: 28 }]}>Sign in to ServLink</Text>
        <Text style={{ color: colors.muted, textAlign: "center" }}>Enter your email to track dispatches across Abuja.</Text>
        <Field label="Email" value={email} onChange={(t) => { setEmail(t); setErr(""); }} placeholder="you@example.com" />
        {err ? <Text style={s.error}>{err}</Text> : null}
        <Btn label={sending ? "Sending…" : secs > 0 ? `Resend in 0:${String(secs).padStart(2, "0")}` : "Send Code"} onPress={() => login(true)} />
        <Text style={s.sub}>Or enter a code you already received:</Text>
        <Btn label="I have a code →" onPress={() => login(false)} tone="ghost" />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={s.sub}>OR AUTHENTICATE WITH</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => setErr("Google sign-in arrives with OAuth credentials — email code for now.")} style={{ flex: 1, borderWidth: 1, borderColor: colors.border, backgroundColor: "#fff", borderRadius: 10, padding: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>G Google</Text>
          </Pressable>
          <Pressable onPress={() => setErr("Facebook sign-in arrives with OAuth credentials — email code for now.")} style={{ flex: 1, borderWidth: 1, borderColor: colors.border, backgroundColor: "#fff", borderRadius: 10, padding: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>f Facebook</Text>
          </Pressable>
        </View>
        <Text style={{ color: colors.muted, textAlign: "center", fontSize: 12 }}>256-bit encrypted platform • NDPA-aligned data handling</Text>
      </View>
    </View>
    </Backdrop>
  );
}

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
    <Backdrop>
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <View style={[s.screen, { flex: 1, backgroundColor: "transparent" }]}>
      <Text style={s.title}>Tell ServLink.{"\n"}We&apos;ll help get it done.</Text>
      <Text style={s.sub}>Logged in as {email}</Text>
      <Link href="/chat" asChild><Btn label="💬 Concierge chat" onPress={() => {}} /></Link>
      <Link href="/services" asChild><Btn label="🧰 Browse artisans" onPress={() => {}} tone="ghost" /></Link>
      <Link href="/jobs" asChild><Btn label="📦 My jobs" onPress={() => {}} tone="ghost" /></Link>
      {isPro && (
        <Link href="/pro" asChild><Btn label="🧰 ServLink Pro" onPress={() => {}} tone="ghost" /></Link>
      )}
      <Link href="/settings" asChild><Btn label="⚙ Settings" onPress={() => {}} tone="ghost" /></Link>
      </View>
    </View>
    </Backdrop>
  );
}
