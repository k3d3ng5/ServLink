import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api } from "../lib/api";
import { session } from "../session";
import { Btn, Field, s, Backdrop } from "../ui";
import { TabBar } from "../tabs";
import { colors } from "../theme";
import { CATEGORIES } from "../theme";
import { EmptyState } from "../components";

interface DirProvider {
  id: string;
  name: string;
  categories: string[];
  tier: string;
  isOnline: boolean;
  jobsCompleted: number;
  avgRating: number | null;
}

// Artisan Guild (Stitch): browse verified providers, search + filter.
// Tapping Request hands into chat with a prefilled message — chat completes it.
export default function Services() {
  const [items, setItems] = useState<DirProvider[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    api
      .directory(cat || undefined)
      .then((r) => setItems(r.providers))
      .catch((e) => setErr((e as Error).message));
  }, [cat]);
  useFocusEffect(load);

  const shown = items.filter((p) =>
    !q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <Backdrop>
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <View style={[s.screen, { flex: 1, backgroundColor: "transparent" }]}>
        <Text style={s.title}>Artisan Guild</Text>
        <Text style={s.sub}>Vetted pros across Abuja — pick one and chat does the rest.</Text>
        <Field label="" value={q} onChange={setQ} placeholder="Search artisans…" />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Pressable onPress={() => setCat("")} style={{ borderWidth: 1, borderColor: !cat ? colors.brand : colors.border, backgroundColor: !cat ? "#E8EFFD" : "#fff", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, marginBottom: 6 }}>
            <Text style={{ color: !cat ? colors.brandDark : colors.ink, fontWeight: "600" }}>All</Text>
          </Pressable>
          {CATEGORIES.map(([label, id]) => (
            <Pressable key={id} onPress={() => setCat(cat === id ? "" : id)} style={{ borderWidth: 1, borderColor: cat === id ? colors.brand : colors.border, backgroundColor: cat === id ? "#E8EFFD" : "#fff", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, marginBottom: 6 }}>
              <Text style={{ color: cat === id ? colors.brandDark : colors.ink, fontWeight: "600" }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {err ? <Text style={s.error}>{err}</Text> : null}
        <FlatList
          data={shown}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ gap: 10 }}
          ListEmptyComponent={<EmptyState title="No artisans here yet" sub="Try another search — new pros join daily." />}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
                    {item.name.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800", fontSize: 16, color: colors.ink }}>{item.name}</Text>
                  <Text style={s.sub}>
                    {item.tier} · {item.jobsCompleted} jobs{item.avgRating ? ` · ★${item.avgRating}` : ""}
                  </Text>
                </View>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.isOnline ? colors.success : colors.border }} />
              </View>
              <Text style={s.sub}>{item.categories.join(" · ")}</Text>
              <Btn
                label={`Request ${item.name.split(" ")[0]} →`}
                tone="ghost"
                onPress={() => router.push({ pathname: "/chat", params: { hello: `I'd like ${item.name} for a job` } })}
              />
            </View>
          )}
        />
      </View>
      <TabBar />
    </View>
    </Backdrop>
  );
}
