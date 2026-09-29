# ServLink Founder Tutorial — plain-English, click-by-click

**Who this is for:** you, the founder, running everything from one Windows laptop.
No experience assumed. Every step says **what to do, where to click, and why**.

**The 30-second map.** ServLink has 4 running pieces on your machine:
- **API** (`:3001`) — the brain. Everything talks to it.
- **Bot** (Telegram) — what customers and providers chat with.
- **Console** (`:3000`) — your web dashboard in a browser.
- **App** (Expo, `:8081`) — the phone app, previewed through Expo Go.
- **Database** (`dev.db` file) — where everything is saved. No server to start.

---

## Part 1 — Back up your work (GitHub Desktop)

**Why:** all 14+ updates live only on this laptop. Publishing copies them to GitHub so a dead laptop can't kill the project.

1. Open **GitHub Desktop**.
2. It shows the `ServLink` repo with unpushed commits. Click **Push origin**.
3. Done when it says everything is up to date. Do this after every work session.

## Part 2 — Fill in the secret keys (core `.env`)

**Why:** the product *works* without these, but its messages go nowhere — OTP codes, match alerts, and follow-ups only print into a log file until real keys are added. No key is ever committed to git (`.env` is ignored — verified).

1. Open File Explorer: `Desktop\ServLink\services\core-api`.
2. If there is no `.env` file there, copy `.env.example` and rename the copy to `.env`.
3. Right-click `.env` → Open with Notepad. Fill these four lines:
   - `TELEGRAM_BOT_TOKEN=` — same token as the bot's own `.env` (from @BotFather). **Why:** lets the brain send match confirmations, job offers, and follow-ups.
   - `ADMIN_CHAT_IDS=` — your Telegram numeric id (message @userinfobot to get it). **Why:** founder alerts and your private `/pending /match /stats` commands.
   - `RESEND_API_KEY=` — from resend.com (free tier). **Why:** delivers OTP login codes by real email. Until then, codes print in the API window (fine for your own testing).
   - `BETTER_AUTH_SECRET=` — any random 32+ characters. **Why:** signs login sessions so they can't be forged.
4. Save, close. Restart the API afterwards (Part 4, step 1) so it picks the keys up.

## Part 3 — Make the bot button-first (BotFather, one time)

**Why:** first-time users should never type commands — Telegram shows them buttons instead.

1. Open **@BotFather** in Telegram → send `/setcommands` → pick your bot → paste:
   ```
   start - Open ServLink
   ```
2. Send `/setdescription` → pick your bot → paste:
   `ServLink: repairs done. Tap START, log in, request or earn — all with buttons.`
3. Users can now open the bot, tap the on-screen **START** button (or just type `Hi`), and never touch a keyboard command again.

## Part 4 — Start everything, in order

**Why:** the brain must be awake before the bot, console, or app can talk to it. Order matters.

Open **three** PowerShell windows (search "PowerShell" in Start, open it 3 times):

**Window 1 — the brain:**
```powershell
cd C:\Users\YAHAYA\Desktop\ServLink\services\core-api
$env:DATABASE_URL="file:./dev.db"
..\..\node_modules\.bin\tsx.cmd watch src/index.ts
```
Wait for `core-api listening on :3001`. Leave the window open.

**Window 2 — the bot:**
```powershell
cd C:\Users\YAHAYA\Desktop\ServLink\apps\telegram-bot
..\..\node_modules\.bin\tsx.cmd watch src/bot.ts
```
Wait for `telegram-bot polling`. Leave it open.

**Window 3 — the dashboard:**
```powershell
cd C:\Users\YAHAYA\Desktop\ServLink\apps\dispatch-console
..\..\node_modules\.bin\next.cmd start --port 3000
```
Wait for `Ready`. Leave it open.

**How you know it's alive:** browser → `http://localhost:3001/health` shows `{"ok":true,...}`; browser → `http://localhost:3000` shows **ServLink Dispatch**.

## Part 5 — See it working (your first full loop)

**Why:** one real loop teaches more than ten pages. Use two Telegram accounts if you can (yours + a spare), or one after the other.

1. **Provider side:** as the "artisan", open the bot → `Hi` → log in with email + code → *Register as provider* → name → services → phone → share location → experience → "under review".
2. **Approve:** open `http://localhost:3000/applications` → **Approve**.
3. **Go online:** in the bot → *Go online* (or later, the Pro screen in the app).
4. **Customer side:** as the "customer" (other account or after registering), *New service request* → describe → category → address → share location → phone → YES.
5. **Watch magic:** the provider gets a job offer with **Accept**; the customer gets "who's coming" with **Confirm**. No action from you.
6. **Finish it:** `/done <ref>` (or console buttons) → follow-up goes out → customer taps YES → job COMPLETED.
7. **Read the scoreboard:** `http://localhost:3000/metrics` and `/analytics` — requests, match rate, completion, leaderboard.

## Part 6 — The phone app (Expo Go)

**Why:** test the customer experience exactly as users will feel it.

1. On your machine: `cd apps\consumer-app` → `npx.cmd expo start`. Wait for `packager-status:running`.
2. Phone + laptop on the **same Wi-Fi**. Install **Expo Go** (Play Store / App Store).
3. In Expo Go tap **Enter URL manually** → type `exp://192.168.1.10:8081` (if your Wi-Fi IP differs, match it in `src\lib\api.ts`).
4. Log in, make a request — it lands in the same dashboard queue as bot requests.

## Part 7 — Your weekly routine (once live)

1. Push in GitHub Desktop (Part 1).
2. Check `/stats` or Analytics: matched fast enough? completed? confirmed good? anyone returning?
3. Approve new provider applications; nudge offline regulars.
4. Rescue only what automation flags (no one online, offers exhausted, reworks).

## Part 8 — When something looks broken

| Symptom | Meaning | Fix |
|---|---|---|
| `Unable to connect` / page won't load | that service isn't running | Part 4 for that window |
| Bot silent | bot process died (needs API up first) | start API, then bot |
| `address already in use` / port busy | old copy still running | close the extra PowerShell windows, start fresh |
| `database is locked` | two writers collided (rare) | stop API, wait 5s, start it |
| OTP code never arrives by email | no Resend key yet | read the code from the API window log, or add the key (Part 2) |
| Page shows old data | console cached it | refresh the browser (buttons now auto-refresh) |
| `git status` shows `.env` | STOP — secret about to leak | tell your assistant before any commit |

*Rule of thumb: 9 times out of 10, "restart the three windows in order" fixes it.*
