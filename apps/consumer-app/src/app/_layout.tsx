import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
  PlayfairDisplay_700Bold,
  useFonts as usePlayfair,
} from "@expo-google-fonts/playfair-display";
import { Inter_400Regular, Inter_600SemiBold, useFonts as useInter } from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts as useJakarta,
} from "@expo-google-fonts/plus-jakarta-sans";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Layout() {
  const [playfair] = usePlayfair({ PlayfairDisplay_700Bold });
  const [inter] = useInter({ Inter_400Regular, Inter_600SemiBold });
  const [jakarta] = useJakarta({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const ready = playfair && inter && jakarta;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerTintColor: "#0B3D2E" }}>
      <Stack.Screen name="index" options={{ title: "ServLink" }} />
      <Stack.Screen name="verify" options={{ title: "Verify" }} />
      <Stack.Screen name="chat" options={{ title: "ServLink chat" }} />
      <Stack.Screen name="request" options={{ title: "New request" }} />
      <Stack.Screen name="jobs" options={{ title: "My jobs" }} />
      <Stack.Screen name="pro" options={{ title: "ServLink Pro" }} />
      <Stack.Screen name="profile" options={{ title: "Privilege" }} />
      <Stack.Screen name="job/[id]" options={{ title: "Job detail" }} />
    </Stack>
  );
}
