import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { api, type RequestView } from "../lib/api";
import { session } from "../session";
import { colors } from "../theme";
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
    <View style={s.screen}>
      <Text style={s.title}>My jobs</Text>
      {err ? <Text style={s.error}>{err}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={<Text style={s.sub}>No requests yet — create one from home.</Text>}
        renderItem={({ item }) => (
          <Link href={`/job/${item.id}`} asChild>
            <Pressable style={s.card}>
              <Text style={{ fontWeight: "700", color: colors.ink }}>{item.description}</Text>
              <Text style={s.sub}>
                {item.zoneId} · {item.status}
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
