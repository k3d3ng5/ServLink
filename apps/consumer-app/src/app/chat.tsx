import { useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { api } from "../lib/api";
import { session } from "../session";
import { colors } from "../theme";
import { s } from "../ui";

interface Msg {
  id: string;
  from: "me" | "bot";
  text: string;
}

let n = 0;
const nid = () => `m${Date.now()}_${n++}`;

const STARTERS = [
  "My tap is leaking",
  "AC blowing hot air",
  "No power in one room",
  "Deep clean my flat",
];

export default function Chat() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [quick, setQuick] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneJobId, setDoneJobId] = useState<string | null>(null);
  const sentGps = useRef(false);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setInput("");
    setMsgs((m) => [...m, { id: nid(), from: "me", text: clean }]);
    setQuick([]);
    setBusy(true);
    try {
      let coords: { latitude: number; longitude: number } | undefined;
      if (!sentGps.current) {
        sentGps.current = true;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          }
        } catch {
          /* GPS optional */
        }
      }
      const r = await api.chat({
        sessionId,
        email: session.email,
        channel: "app",
        message: clean,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
      });
      setSessionId(r.sessionId);
      setMsgs((m) => [...m, { id: nid(), from: "bot", text: r.reply }]);
      setQuick(r.quickReplies ?? []);
      if (r.done && r.requestId) setDoneJobId(r.requestId);
    } catch (e) {
      setMsgs((m) => [...m, { id: nid(), from: "bot", text: `Hmm, that didn't go through (${(e as Error).message}). Try again.` }]);
    } finally {
      setBusy(false);
    }
  }

  const fresh = msgs.length === 0;

  return (
    <View style={[s.screen, { paddingBottom: 12 }]}>
      {fresh ? (
        <View style={{ flex: 1, justifyContent: "center", gap: 16 }}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800" }}>S</Text>
            </View>
            <Text style={[s.title, { textAlign: "center" }]}>What needs fixing today?</Text>
            <Text style={[s.sub, { textAlign: "center" }]}>Tell me in plain words — I&apos;ll find the closest trusted provider.</Text>
          </View>
          {STARTERS.map((q) => (
            <Pressable
              key={q}
              onPress={() => send(q)}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 }}
            >
              <Text style={{ color: colors.ink, fontSize: 15 }}>{q}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <FlatList
          data={msgs}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ gap: 8, flexGrow: 1, paddingTop: 8 }}
          renderItem={({ item }) =>
            item.from === "me" ? (
              <View style={{ alignSelf: "flex-end", backgroundColor: "#EEF2F1", borderRadius: 16, padding: 10, maxWidth: "85%" }}>
                <Text style={{ color: colors.ink }}>{item.text}</Text>
              </View>
            ) : (
              <View style={{ flexDirection: "row", gap: 8, maxWidth: "90%" }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>S</Text>
                </View>
                <Text style={{ color: colors.ink, fontSize: 15, lineHeight: 22, flexShrink: 1 }}>{item.text}</Text>
              </View>
            )
          }
        />
      )}
      {busy && (
        <View style={{ flexDirection: "row", gap: 8, paddingVertical: 4 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }}>S</Text>
          </View>
          <Text style={s.sub}>ServLink is thinking…</Text>
        </View>
      )}
      {quick.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {quick.map((q) => (
            <Pressable
              key={q}
              onPress={() => send(q)}
              style={{ borderWidth: 1, borderColor: colors.brand, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, marginBottom: 6 }}
            >
              <Text style={{ color: colors.brandDark, fontWeight: "600" }}>{q}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 24, paddingLeft: 16, paddingRight: 6, paddingVertical: 6 }}>
        <TextInput
          style={{ flex: 1, fontSize: 16, color: colors.ink }}
          value={input}
          onChangeText={setInput}
          placeholder="Message ServLink…"
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable
          onPress={() => send(input)}
          style={{ backgroundColor: colors.brand, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>↑</Text>
        </Pressable>
      </View>
      {doneJobId && (
        <Pressable
          onPress={() => router.push(`/job/${doneJobId}`)}
          style={{ backgroundColor: colors.accent, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 8 }}
        >
          <Text style={{ fontWeight: "800", color: colors.ink }}>View my job →</Text>
        </Pressable>
      )}
    </View>
  );
}
