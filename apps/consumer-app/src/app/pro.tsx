import { useCallback, useEffect, useState } from "react";
import { Link, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../lib/api";
import { session } from "../session";
import { EmptyState, StatusChip } from "../components";
import { TabBar } from "../tabs";
import { Backdrop, Btn, s } from "../ui";
import { colors } from "../theme";

interface Offer {
  id: string;
  expiresAt: string;
  job: { id: string; request: { description: string; zoneId: string; address: string } };
}

function countdown(expiresAt: string, now: number): string {
  const s = Math.max(0, Math.round((new Date(expiresAt).getTime() - now) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ServLink Pro (Stitch dispatch): online toggle, live offer card with countdown,
// accept/decline wired to the same offer engine as the bot.
export default function Pro() {
  const [proId, setProId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [err, setErr] = useState("");
  const [now, setNow] = useState(Date.now());

  const load = useCallback(() => {
    api
      .proMe()
      .then(async (r) => {
        setProId(r.provider.id);
        setIsOnline(r.provider.isOnline);
        try {
          const o = await api.offers(r.provider.id);
          setOffers(o.offers);
        } catch {
          setOffers([]);
        }
      })
      .catch((e) => setErr((e as Error).message));
  }, []);
  useFocusEffect(load);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  async function setOnline(online: boolean) {
    if (!proId) return;
    try {
      await api.setOnline(proId, online);
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function answer(jobId: string, ok: boolean) {
    try {
      if (ok) await api.acceptJob(jobId);
      else await api.declineJob(jobId);
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (err)
    return (
      <View style={s.screen}>
        <Text style={s.title}>ServLink Pro</Text>
        <Text style={s.sub}>{err}</Text>
        <Text style={s.sub}>No provider profile on this login yet — register via the Telegram bot first.</Text>
      </View>
    );

  return (
    <Backdrop>
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1, backgroundColor: "transparent" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={s.sub}>{isOnline ? "● Online · Accepting" : "○ Offline"}</Text>
            <Text style={s.title}>Dispatch</Text>
          </View>
          <Pressable
            onPress={() => setOnline(!isOnline)}
            style={{ backgroundColor: isOnline ? colors.success : colors.muted, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>{isOnline ? "ON" : "OFF"}</Text>
          </Pressable>
        </View>

        {offers.map((o) => (
          <View key={o.id} style={[s.card, { borderWidth: 2, borderColor: colors.brand }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "800", color: colors.brand, fontSize: 13, letterSpacing: 1 }}>⚡ NEW DISPATCH OFFER</Text>
              <Text style={{ fontWeight: "800", color: colors.danger }}>⏱ {countdown(o.expiresAt, now)}</Text>
            </View>
            <Text style={{ fontWeight: "800", fontSize: 17, color: colors.ink }}>{o.job.request.description}</Text>
            <Text style={s.sub}>{o.job.request.zoneId} · {o.job.request.address}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn label="Decline" tone="ghost" onPress={() => answer(o.job.id, false)} />
              </View>
              <View style={{ flex: 2 }}>
                <Btn label="Accept Job ✓" onPress={() => answer(o.job.id, true)} />
              </View>
            </View>
          </View>
        ))}

        <Link href="/jobs" asChild><Btn label="View my jobs →" onPress={() => {}} tone="ghost" /></Link>
        {err ? <Text style={s.error}>{err}</Text> : null}
      </ScrollView>
      <TabBar />
    </View>
    </Backdrop>
  );
}
