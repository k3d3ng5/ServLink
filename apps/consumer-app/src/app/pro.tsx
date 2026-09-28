import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { api } from "../lib/api";
import { session } from "../session";
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
    <View style={s.screen}>
      <Text style={s.title}>{pro.isOnline ? "🟢 Online" : "🔴 Offline"}</Text>
      <Text style={s.sub}>Nearby jobs find you while online.</Text>
      {pro.isOnline
        ? <Btn label="🔴 Go offline" onPress={() => setOnline(false)} tone="danger" />
        : <Btn label="🟢 Go online" onPress={() => setOnline(true)} />}
      <Text style={{ fontWeight: "700", marginTop: 8 }}>My jobs</Text>
      {pro.jobs.length === 0 && <Text style={s.sub}>No jobs yet.</Text>}
      {pro.jobs.map((j) => (
        <Link key={j.id} href={`/job/${j.id}`} asChild>
          <Btn label={`${j.request.description.slice(0, 40)} — ${j.request.status}`} onPress={() => router.push(`/job/${j.id}`)} tone="ghost" />
        </Link>
      ))}
    </View>
  );
}
