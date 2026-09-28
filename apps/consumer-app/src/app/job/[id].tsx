import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { api, type RequestView } from "../../lib/api";
import { Btn, s } from "../../ui";
import { colors } from "../../theme";

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [req, setReq] = useState<RequestView | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    api.request(id).then((r) => setReq(r.request)).catch((e) => setMsg((e as Error).message));
  }, [id]);
  useFocusEffect(load);

  async function act(label: string, fn: () => Promise<unknown>) {
    setMsg("");
    try { await fn(); setMsg(`${label} ✓`); load(); }
    catch (e) { setMsg(`${label} failed: ${(e as Error).message}`); }
  }

  if (!req) return <View style={s.screen}><Text style={s.sub}>Loading…{msg}</Text></View>;
  const job = req.jobs.at(-1);
  const followUpId = job?.followUps.at(-1)?.id;
  const awaitingFeedback = ["DONE_PENDING_CONFIRM", "FOLLOW_UP_SENT"].includes(req.status);

  return (
    <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1 }]}>
      <Text style={s.title}>{req.description}</Text>
      <Text style={s.sub}>{req.zoneId} · {req.address}</Text>
      <View style={s.card}>
        <Text style={{ fontWeight: "800", fontSize: 18, color: colors.brandDark }}>{req.status}</Text>
        {job && <Text style={s.sub}>Provider: {job.provider.name}</Text>}
      </View>

      {awaitingFeedback && followUpId && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700" }}>Was it done well?</Text>
          <Btn label="✅ Yes, done well" onPress={() => act("Confirmed", () => api.respondFollowUp(followUpId, true))} />
          <Btn label="🔧 No, needs rework" onPress={() => act("Rework opened", () => api.respondFollowUp(followUpId, false))} tone="danger" />
        </View>
      )}
      {msg ? <Text style={s.sub}>{msg}</Text> : null}

      <Text style={{ fontWeight: "700", marginTop: 8 }}>History</Text>
      {req.events.map((e, i) => (
        <Text key={i} style={s.sub}>{e.fromStatus} → {e.toStatus} · {e.actor}</Text>
      ))}
    </ScrollView>
  );
}
