import { useCallback, useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { api, type RequestView } from "../../lib/api";
import { Backdrop, Btn, s } from "../../ui";
import { EmptyState, StatusChip } from "../../components";
import { TabBar } from "../../tabs";
import { colors } from "../../theme";

// Live Dispatch Tracker style: provider card + mission timeline, real data.
const STEP_ORDER = ["REQUESTED", "MATCHED", "CONFIRMED", "IN_PROGRESS", "DONE_PENDING_CONFIRM", "COMPLETED"];

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

  if (!req) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.paper }}>
        <View style={s.screen}><EmptyState title="Loading job…" sub={msg || "Fetching live status."} /></View>
        <TabBar />
      </View>
    );
  }
  const job = req.jobs.at(-1);
  const followUpId = job?.followUps.at(-1)?.id;
  const awaitingFeedback = ["DONE_PENDING_CONFIRM", "FOLLOW_UP_SENT"].includes(req.status);
  const reachedIdx = STEP_ORDER.indexOf(req.status === "FOLLOW_UP_SENT" ? "DONE_PENDING_CONFIRM" : req.status);

  return (
    <Backdrop>
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1, backgroundColor: "transparent" }]}>
        <Text style={s.title}>{req.description}</Text>
        <Text style={s.sub}>{req.zoneId} · {req.address} · ref {req.id.slice(0, 8)}</Text>

        {job && (
          <View style={s.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
                  {job.provider.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", fontSize: 16, color: colors.ink }}>{job.provider.name}</Text>
                <Text style={s.sub}>Assigned provider</Text>
              </View>
              <StatusChip status={req.status} />
            </View>
          </View>
        )}

        <View style={s.card}>
          <Text style={{ fontWeight: "800", marginBottom: 8, color: colors.ink }}>Mission progression</Text>
          {STEP_ORDER.map((step, i) => {
            const done = reachedIdx >= 0 && i <= reachedIdx;
            const current = i === reachedIdx;
            return (
              <View key={step} style={{ flexDirection: "row", gap: 10, paddingVertical: 5, opacity: done || current ? 1 : 0.45 }}>
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: done ? colors.brand : current ? colors.accent : colors.surfaceHigh,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ color: done || current ? "#fff" : colors.muted, fontSize: 11, fontWeight: "800" }}>
                    {done ? "✓" : i + 1}
                  </Text>
                </View>
                <Text style={{ color: colors.ink, fontWeight: current ? "800" : "400", paddingTop: 1 }}>
                  {step.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                </Text>
              </View>
            );
          })}
        </View>

        {awaitingFeedback && followUpId && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Was it done well?</Text>
            <Btn label="✅ Yes, done well" onPress={() => act("Confirmed", () => api.respondFollowUp(followUpId, true))} />
            <Btn label="🔧 No, needs rework" onPress={() => act("Rework opened", () => api.respondFollowUp(followUpId, false))} tone="danger" />
          </View>
        )}
        {job?.amountKobo ? (
          <View style={[s.card, { gap: 8 }]}>
            <Text style={{ fontWeight: "800", fontSize: 18 }}>
              ₦{(job.amountKobo / 100).toLocaleString("en-NG")}
            </Text>
            <Text style={s.sub}>
              {job.paymentStatus === "paid" ? "✅ Paid — receipt sent" : "Payment pending"}
            </Text>
            {job.paymentStatus !== "paid" && (
              <Btn
                label="💳 Pay with Paystack"
                tone="gold"
                onPress={() =>
                  act("Pay link", async () => {
                    const r = await api.payInit(job.id);
                    await Linking.openURL(r.authorization_url);
                  })
                }
              />
            )}
          </View>
        ) : null}
        <Btn label="↻ Book this again" onPress={() => router.push("/request")} tone="ghost" />
        {msg ? <Text style={s.sub}>{msg}</Text> : null}
      </ScrollView>
      <TabBar />
    </View>
    </Backdrop>
  );
}
