import { Text, View } from "react-native";
import { router } from "expo-router";
import { API_URL } from "../lib/api";
import { session } from "../session";
import { Backdrop, Btn, s } from "../ui";
import { TabBar } from "../tabs";
import { colors } from "../theme";

export default function Settings() {
  function logout() {
    session.email = "";
    router.replace({ pathname: "/", params: { t: String(Date.now()) } });
  }

  return (
    <Backdrop>
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <View style={[s.screen, { flex: 1, backgroundColor: "transparent" }]}>
        <Text style={s.title}>Settings</Text>
        <View style={s.card}>
          <Text style={{ fontWeight: "700", color: colors.ink }}>Account</Text>
          <Text style={s.sub}>{session.email || "Not logged in"}</Text>
        </View>
        <View style={s.card}>
          <Text style={{ fontWeight: "700", color: colors.ink }}>Server</Text>
          <Text style={s.sub}>{API_URL}</Text>
        </View>
        <View style={s.card}>
          <Text style={{ fontWeight: "700", color: colors.ink }}>About ServLink</Text>
          <Text style={s.sub}>Trusted home services, perfected. v1.0.0 (preview).</Text>
        </View>
        <Btn label="Log out" tone="danger" onPress={logout} />
      </View>
      <TabBar />
    </View>
    </Backdrop>
  );
}
