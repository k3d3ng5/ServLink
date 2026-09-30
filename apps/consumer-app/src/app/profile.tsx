import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { api, type RequestView } from "../lib/api";
import { session } from "../session";
import { Btn, s } from "../ui";
import { TabBar } from "../tabs";
import { colors } from "../theme";

// Privilege Profile (Stitch: membership card + stats, real data only).
export default function Profile() {
  const [items, setItems] = useState<RequestView[]>([]);
  useFocusEffect(
    useCallback(() => {
      api.myRequests(session.email).then((r) => setItems(r.requests)).catch(() => {});
    }, [])
  );
  const completed = items.filter((r) => r.status === "COMPLETED").length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1 }]}>
        <View style={{ backgroundColor: colors.tertiaryContainer, borderRadius: 16, padding: 20, gap: 8 }}>
          <Text style={{ color: colors.goldSoft, fontSize: 11, letterSpacing: 2, fontWeight: "700" }}>
            SERVLINK PRIVILEGE
          </Text>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", fontFamily: "PlayfairDisplay_700Bold" }}>
            {session.email}
          </Text>
          <Text style={{ color: colors.goldSoft, fontSize: 13 }}>
            {completed} completed · {items.length} total requests
          </Text>
        </View>

        <View style={[s.card, { flexDirection: "row", justifyContent: "space-around" }]}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.ink }}>{items.length}</Text>
            <Text style={s.sub}>Requests</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.ink }}>{completed}</Text>
            <Text style={s.sub}>Completed</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.ink }}>
              {items.length ? Math.round((completed / items.length) * 100) : 0}%
            </Text>
            <Text style={s.sub}>Success</Text>
          </View>
        </View>

        <Link href="/jobs" asChild><Btn label="View activity" onPress={() => {}} tone="ghost" /></Link>
      </ScrollView>
      <TabBar />
    </View>
  );
}
