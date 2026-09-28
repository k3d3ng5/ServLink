import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerTintColor: "#0B6B4F" }}>
      <Stack.Screen name="index" options={{ title: "ServLink" }} />
      <Stack.Screen name="verify" options={{ title: "Verify" }} />
      <Stack.Screen name="request" options={{ title: "New request" }} />
      <Stack.Screen name="jobs" options={{ title: "My jobs" }} />
      <Stack.Screen name="pro" options={{ title: "ServLink Pro" }} />
      <Stack.Screen name="job/[id]" options={{ title: "Job detail" }} />
    </Stack>
  );
}
