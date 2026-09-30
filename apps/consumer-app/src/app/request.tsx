import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { api } from "../lib/api";
import { session } from "../session";
import { CATEGORIES, colors } from "../theme";
import { Btn, Field, s } from "../ui";
import { TabBar } from "../tabs";

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: selected ? colors.brand : colors.border,
        backgroundColor: selected ? "#E6F4EE" : "#fff",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: selected ? colors.brandDark : colors.ink, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

export default function RequestScreen() {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [address, setAddress] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    setSending(true);
    setErr("");
    try {
      // GPS auto-attach: closest providers rank first. Falls back to zone match.
      let coords: { latitude: number; longitude: number } | null = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }
      } catch {
        /* GPS optional — address + zone still match */
      }
      const { request } = await api.createRequest({
        description,
        categoryId: categoryId || undefined,
        address,
        ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
        channel: "app",
        handle: session.email,
        email: session.email,
      });
      router.replace(`/job/${request.id}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF7F0" }}>
      <ScrollView contentContainerStyle={[s.screen, { flexGrow: 1 }]}>
      {step === 0 && (
        <>
          <Text style={s.title}>What needs doing?</Text>
          <Field label="Describe it" value={description} onChange={setDescription} placeholder="Kitchen sink leaking" multiline />
          <Btn label="Next" onPress={() => (description.trim().length >= 3 ? setStep(1) : setErr("Describe it in a few words."))} />
        </>
      )}
      {step === 1 && (
        <>
          <Text style={s.title}>What kind of work?</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {CATEGORIES.map(([label, id]) => (
              <Chip key={id} label={label} selected={categoryId === id} onPress={() => setCategoryId(id)} />
            ))}
          </View>
          <Btn label="Next" onPress={() => (categoryId ? setStep(2) : setErr("Pick a category."))} />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={s.title}>Where exactly?</Text>
          <Field label="Address / landmark" value={address} onChange={setAddress} placeholder="House 5, 3rd Avenue, Gwarinpa" />
          <Text style={s.sub}>Booking as {session.email} · GPS auto-attached when permitted</Text>
          <Btn label={sending ? "Sending…" : "Confirm request"} onPress={() => { if (address.trim().length >= 3 && !sending) submit(); else setErr("Add a street address or landmark."); }} />
        </>
      )}
      {err ? <Text style={s.error}>{err}</Text> : null}
      {step > 0 && <Btn label="← Back" onPress={() => { setStep(step - 1); setErr(""); }} tone="ghost" />}
      </ScrollView>
      <TabBar />
    </View>
  );
}
