import { Pressable, Text, View } from "react-native";
import { Link, usePathname } from "expo-router";
import { colors } from "./theme";

const TABS = [
  ["Concierge", "/chat", "✦"],
  ["Services", "/request", "🛠"],
  ["Activity", "/jobs", "🕘"],
  ["Privilege", "/profile", "♛"],
] as const;

// Stitch-style bottom tab bar: ivory, gold active pill, 44pt+ targets.
export function TabBar() {
  const pathname = usePathname();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingVertical: 8,
        paddingBottom: 20,
      }}
    >
      {TABS.map(([label, href, icon]) => {
        const active = pathname === href || (href !== "/chat" && pathname.startsWith(href + "/"));
        return (
          <Link key={href} href={href as never} asChild>
            <Pressable
              style={{ alignItems: "center", gap: 2, minWidth: 64, minHeight: 48, justifyContent: "center", paddingHorizontal: 12, borderRadius: 16, backgroundColor: active ? "#EDE8D2" : "transparent" }}
            >
              <Text style={{ fontSize: 20, color: active ? colors.brand : colors.muted }}>{icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: active ? "700" : "500", color: active ? colors.brand : colors.muted }}>
                {label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
