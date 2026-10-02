import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts as useJakarta,
} from "@expo-google-fonts/plus-jakarta-sans";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Layout() {
  const [fonts] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  const [jakarta] = useJakarta({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const ready = fonts && jakarta;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerTintColor: "#0556ed" }}>
      <Stack.Screen name="index" options={{ title: "ServLink" }} />
      <Stack.Screen name="verify" options={{ title: "Verify" }} />
      <Stack.Screen name="chat" options={{ title: "ServLink chat" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="jobs" options={{ title: "My jobs" }} />
      <Stack.Screen name="pro" options={{ title: "ServLink Pro" }} />
      <Stack.Screen name="profile" options={{ title: "Privilege" }} />
      <Stack.Screen name="job/[id]" options={{ title: "Job detail" }} />
    </Stack>
  );
}
