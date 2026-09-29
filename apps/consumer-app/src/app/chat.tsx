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

export default function Chat() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: nid(), from: "bot", text: "Hi! Tell me what needs fixing — e.g. 'my kitchen sink is leaking'." },
  ]);
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

  return (
    <View style={[s.screen, { paddingBottom: 12 }]}>
      <FlatList
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ gap: 8, flexGrow: 1 }}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.from === "me" ? "flex-end" : "flex-start",
              backgroundColor: item.from === "me" ? colors.brand : "#F3F4F6",
              borderRadius: 14,
              padding: 10,
              maxWidth: "85%",
            }}
          >
            <Text style={{ color: item.from === "me" ? "#fff" : colors.ink }}>{item.text}</Text>
          </View>
        )}
      />
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
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message…"
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable
          onPress={() => send(input)}
          style={{ backgroundColor: colors.brand, borderRadius: 10, paddingHorizontal: 18, justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>➤</Text>
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
