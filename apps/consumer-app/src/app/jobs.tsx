import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { api, type RequestView } from "../lib/api";
import { session } from "../session";
import { EmptyState, StatusChip } from "../components";
import { TabBar } from "../tabs";
import { s } from "../ui";

export default function Jobs() {
  const [items, setItems] = useState<RequestView[]>([]);
  const [err, setErr] = useState("");

  useFocusEffect(
    useCallback(() => {
      let live = true;
      api
        .myRequests(session.email)
        .then((r) => live && setItems(r.requests))
        .catch((e) => live && setErr((e as Error).message));
      return () => { live = false; };
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF7F0" }}>
      <View style={[s.screen, { flex: 1 }]}>
      <Text style={s.title}>My jobs</Text>
      {err ? <Text style={s.error}>{err}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={<EmptyState title="No jobs yet" sub="Create a request and it will appear here with live status." />}
        renderItem={({ item }) => (
          <Link href={`/job/${item.id}`} asChild>
            <Pressable style={[s.card, { gap: 8 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "700", color: "#14201C", flex: 1 }}>{item.description}</Text>
                <StatusChip status={item.status} />
              </View>
              <View style={{ height: 1, backgroundColor: "#E7DFC9" }} />
              <Text style={s.sub}>
                {item.zoneId} · ref {item.id.slice(0, 8)}
              </Text>
            </Pressable>
          </Link>
        )}
      />
      </View>
      <TabBar />
    </View>
  );
}
