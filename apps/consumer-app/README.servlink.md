# consumer-app (Expo 57, Android + iOS)

Expo Router app — routes in `src/app/`, shared code outside it.

## Run (dev machine + Expo Go on the same Wi-Fi)

```powershell
cd apps/consumer-app
npx.cmd expo start
```

Scan the QR with Expo Go. **Phone can't reach `localhost`** — set your machine's
LAN IP in `src/lib/api.ts` (`API_URL`).

## Screens (MVP)

- `/` — email gate + menu · `/request` — 4-step wizard · `/jobs` — history ·
  `/job/[id]` — status + was-it-done-well buttons + audit trail.

Identity = email (matches API customer upsert). OTP login lands with Better Auth
once the Resend key exists. Push notifications: Expo Push in Phase 4 final pass.

## Typecheck / lint (per repo rules)

```powershell
npx.cmd tsc --noEmit; npx.cmd expo lint
```
