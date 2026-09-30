import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { api } from "../lib/api";
import { session } from "../session";
import { EmptyState, StatusChip } from "../components";
import { TabBar } from "../tabs";
import { colors } from "../theme";
import { Btn, s } from "../ui";

export interface ProScreen {
  id: string;
  isOnline: boolean;
  jobs: Array<{ id: string; request: { description: string; status: string } }>;
}

export default function Pro() {
  const [pro, setPro] = useState<ProScreen | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    api
      .proMe()
      .then((r) => setPro(r.provider))
      .catch((e) => setErr((e as Error).message));
  }, []);
  useFocusEffect(load);

  async function setOnline(online: boolean) {
    if (!pro) return;
    try {
      await api.setOnline(pro.id, online);
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
        <Text style={s.sub}>No provider profile on this login yet — register via the Telegram bot 🧰 first.</Text>
      </View>
    );
  if (!pro) return <View style={s.screen}><Text style={s.sub}>Loading…</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF7F0" }}>
      <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1 }]}>
      <View style={[s.card, { alignItems: "center", gap: 8, paddingVertical: 18 }]}>
        <Text style={{ fontSize: 15, color: "#6B7280" }}>{pro.isOnline ? "You're visible to nearby jobs" : "You're hidden from new jobs"}</Text>
        <Text style={{ fontSize: 22, fontWeight: "800", color: pro.isOnline ? colors.brand : "#6B7280" }}>
          {pro.isOnline ? "🟢 Online" : "🔴 Offline"}
        </Text>
        {pro.isOnline
          ? <Btn label="Go offline" onPress={() => setOnline(false)} tone="danger" />
          : <Btn label="Go online" onPress={() => setOnline(true)} />}
      </View>
      <Text style={{ fontWeight: "700", marginTop: 8 }}>My jobs ({pro.jobs.length})</Text>
      {pro.jobs.length === 0 && <EmptyState title="No jobs yet" sub="Stay online — nearby requests will appear here." />}
      {pro.jobs.map((j) => (
        <Link key={j.id} href={`/job/${j.id}`} asChild>
          <Pressable style={[s.card, { gap: 6 }]}>
            <Text style={{ fontWeight: "700" }}>{j.request.description.slice(0, 60)}</Text>
            <StatusChip status={j.request.status} />
          </Pressable>
        </Link>
      ))}
      </ScrollView>
      <TabBar />
    </View>
  );
}
