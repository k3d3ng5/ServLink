# consumer-app (Expo, Android + iOS)

Full scaffold lands in Phase 4:

```powershell
cd apps/consumer-app
npx create-expo-app@latest . --template tabs
npx expo install expo-router
```

`app.json` already reserves the name/slug/bundle IDs.
The 5 MVP screens (Phase 1 spec) talk to `services/core-api` only.
