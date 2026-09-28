import "dotenv/config";
import { Bot, Context, Keyboard, session, SessionFlavor } from "grammy";

const API = process.env.CORE_API_URL ?? "http://localhost:3001";
const ADMIN_IDS = (process.env.ADMIN_CHAT_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const CATEGORIES = [
  ["Plumbing", "plumbing"],
  ["Electrical", "electrical"],
  ["AC / HVAC", "ac-hvac"],
  ["Cleaning", "cleaning"],
  ["Generator / Solar", "generator-solar"],
  ["Handyman", "handyman"],
  ["Moving", "moving"],
  ["Auto assistance", "auto-assistance"],
] as const;

interface Draft {
  flow?: "login" | "request" | "provider";
  step?: string;
  data?: Record<string, string>;
  email?: string;
  isProvider?: boolean;
}
type Ctx = Context & SessionFlavor<Draft>;

const bot = new Bot<Ctx>(process.env.TELEGRAM_BOT_TOKEN ?? "");
bot.use(session({ initial: (): Draft => ({}) }));

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
  return body as T;
}

const cancelKb = new Keyboard().text("❌ Cancel").resized();

function menuKb(isProvider: boolean) {
  const kb = new Keyboard()
    .text("🛠 New service request")
    .text("📦 My status")
    .row();
  if (isProvider) kb.text("🟢 Go online").text("🔴 Go offline").row().text("🧾 My jobs");
  else kb.text("🧰 Register as provider");
  return kb.resized();
}

async function showMenu(ctx: Ctx) {
  const chatId = String(ctx.chat?.id);
  const check = await api<{ loggedIn: boolean; email: string | null; isProvider: boolean }>(
    `/auth/check-telegram?chatId=${encodeURIComponent(chatId)}`
  );
  ctx.session.email = check.email ?? undefined;
  ctx.session.isProvider = check.isProvider;
  await ctx.reply(
    check.isProvider
      ? "ServLink Pro — request services, take jobs, track everything, all here."
      : "ServLink — tell me what needs doing, I'll handle the rest.",
    { reply_markup: menuKb(check.isProvider) }
  );
}

bot.command("start", async (ctx) => {
  ctx.session = {};
  const chatId = String(ctx.chat?.id);
  try {
    const check = await api<{ loggedIn: boolean }>(
      `/auth/check-telegram?chatId=${encodeURIComponent(chatId)}`
    );
    if (check.loggedIn) return showMenu(ctx);
  } catch {
    // fall through to login
  }
  ctx.session = { flow: "login", step: "email", data: {} };
  await ctx.reply(
    "Welcome to ServLink 🔐\nLog in with your email to continue — I'll send a one-time code.",
    { reply_markup: cancelKb }
  );
});

bot.hears("❌ Cancel", async (ctx) => {
  const wasLoggedIn = Boolean(ctx.session.email);
  ctx.session = wasLoggedIn ? { email: ctx.session.email, isProvider: ctx.session.isProvider } : {};
  if (wasLoggedIn) await showMenu(ctx);
  else await ctx.reply("Cancelled. Send /start to log in.", { reply_markup: cancelKb });
});

// ---------- Customer: request wizard (no area picker — GPS or auto-zone) ----------
bot.hears("🛠 New service request", async (ctx) => {
  if (!ctx.session.email) return ctx.reply("Log in first with /start.");
  ctx.session.flow = "request";
  ctx.session.step = "description";
  ctx.session.data = {};
  await ctx.reply("What needs doing? Describe it briefly (e.g. *Kitchen sink leaking*).", {
    reply_markup: cancelKb,
    parse_mode: "Markdown",
  });
});

// ---------- Provider: registration + availability (buttons only) ----------
bot.hears("🧰 Register as provider", async (ctx) => {
  if (!ctx.session.email) return ctx.reply("Log in first with /start.");
  ctx.session.flow = "provider";
  ctx.session.step = "name";
  ctx.session.data = {};
  await ctx.reply("Let's get you earning. What's your *full name*?", {
    reply_markup: cancelKb,
    parse_mode: "Markdown",
  });
});

bot.hears(["🟢 Go online", "🔴 Go offline"], async (ctx) => {
  const chatId = String(ctx.chat?.id);
  try {
    const { provider } = await api<{ provider: { id: string } }>(
      `/providers/me?chatId=${encodeURIComponent(chatId)}`
    );
    const online = ctx.msg?.text?.startsWith("🟢") ?? false;
    await api(`/providers/${provider.id}/online`, {
      method: "POST",
      body: JSON.stringify({ online }),
    });
    await ctx.reply(online ? "🟢 You're online — nearby jobs will find you." : "🔴 You're offline. Rest well.", {
      reply_markup: menuKb(true),
    });
  } catch {
    await ctx.reply("No provider profile on this chat yet — register with 🧰 first.", {
      reply_markup: menuKb(false),
    });
  }
});

bot.hears("🧾 My jobs", async (ctx) => {
  const chatId = String(ctx.chat?.id);
  try {
    const { provider } = await api<{
      provider: { isOnline: boolean; jobs: Array<{ id: string; request: { description: string; status: string } }> };
    }>(`/providers/me?chatId=${encodeURIComponent(chatId)}`);
    const lines = provider.jobs.map(
      (j) => `• ${j.request.description.slice(0, 50)} — *${j.request.status}* (\`${j.id.slice(0, 8)}\`)`
    );
    await ctx.reply(
      `${provider.isOnline ? "🟢 Online" : "🔴 Offline"}\n` + (lines.length ? lines.join("\n") : "No jobs yet."),
      { reply_markup: menuKb(true), parse_mode: "Markdown" }
    );
  } catch {
    await ctx.reply("No provider profile on this chat yet.", { reply_markup: menuKb(false) });
  }
});

// ---------- Status ----------
bot.hears("📦 My status", async (ctx) => {
  if (!ctx.session.email) return ctx.reply("Log in first with /start.");
  const chatId = String(ctx.chat?.id);
  try {
    const { requests } = await api<{
      requests: Array<{ id: string; description: string; status: string }>;
    }>(`/requests?channel=telegram&handle=${encodeURIComponent(chatId)}`);
    if (!requests.length) {
      await ctx.reply("No requests yet. Tap 🛠 to create one.", {
        reply_markup: menuKb(ctx.session.isProvider ?? false),
      });
      return;
    }
    const lines = requests
      .slice(-5)
      .map((r) => `• ${r.description.slice(0, 60)} — *${r.status}* (ref \`${r.id.slice(0, 8)}\`)`);
    await ctx.reply(`Your recent requests:\n${lines.join("\n")}`, {
      reply_markup: menuKb(ctx.session.isProvider ?? false),
      parse_mode: "Markdown",
    });
  } catch (e) {
    await ctx.reply(`Couldn't load status: ${(e as Error).message}`);
  }
});

bot.on("message:text", async (ctx, next) => {
  const s = ctx.session;
  if (!s.flow) return next();
  const text = ctx.msg.text.trim();
  const d = (s.data ??= {});

  // ----- login flow -----
  if (s.flow === "login") {
    if (s.step === "email") {
      if (!/^\S+@\S+\.\S+$/.test(text)) return ctx.reply("That doesn't look like an email — try again.");
      d.email = text.toLowerCase();
      try {
        await api("/api/auth/email-otp/send-verification-otp", {
          method: "POST",
          body: JSON.stringify({ email: d.email, type: "sign-in" }),
        });
        s.step = "code";
        await ctx.reply(`Code sent to ${d.email} — type the 6-digit code here.`, { reply_markup: cancelKb });
      } catch (e) {
        await ctx.reply(`Couldn't send code: ${(e as Error).message}. Check the email and retry.`);
      }
    } else if (s.step === "code") {
      const otp = text.replace(/\D/g, "");
      if (otp.length < 4) return ctx.reply("Type the code from your email (digits only).");
      try {
        const session = (await api("/api/auth/sign-in/email-otp", {
          method: "POST",
          body: JSON.stringify({ email: d.email, otp }),
        })) as { token?: string };
        const token = session.token;
        if (!token) throw new Error("no session returned");
        const chatId = String(ctx.chat?.id);
        await api("/auth/link-telegram", {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
          body: JSON.stringify({ telegramChatId: chatId }),
        });
        s.flow = undefined;
        s.step = undefined;
        await ctx.reply("✅ Logged in — this Telegram is now linked to your ServLink account.");
        await showMenu(ctx);
      } catch {
        await ctx.reply("Wrong or expired code — try again, or ❌ Cancel and /start over.");
      }
    }
    return;
  }

  if (!s.email) return ctx.reply("Log in first with /start.");

  // ----- request flow (no zone step — GPS or server auto-zone) -----
  if (s.flow === "request") {
    if (s.step === "description") {
      if (text.length < 3) return ctx.reply("A little more detail please.");
      d.description = text;
      s.step = "category";
      const kb = new Keyboard();
      CATEGORIES.forEach(([label], i) => {
        kb.text(label);
        if (i % 2 === 1) kb.row();
      });
      await ctx.reply("What kind of work is it?", { reply_markup: kb.resized() });
    } else if (s.step === "category") {
      const found = CATEGORIES.find(([label]) => label === text);
      if (!found) return ctx.reply("Please pick one of the listed categories.");
      d.categoryId = found[1];
      s.step = "address";
      await ctx.reply("Street address / landmark?", { reply_markup: cancelKb });
    } else if (s.step === "address") {
      if (text.length < 3) return ctx.reply("Add a street address or landmark.");
      d.address = text;
      s.step = "location";
      await ctx.reply(
        "Share your live location 📍 so the *closest* provider ranks first — or /skip.",
        { reply_markup: new Keyboard().requestLocation("📍 Share location").text("❌ Cancel").resized() }
      );
    } else if (s.step === "location") {
      if (text === "/skip") {
        s.step = "phone";
        await ctx.reply("Your phone number? (we'll call about the job)", {
          reply_markup: new Keyboard().requestContact("📱 Share my number").text("❌ Cancel").resized(),
        });
      } else {
        return ctx.reply("Tap 📍 Share location, or /skip to continue without GPS.");
      }
    } else if (s.step === "phone") {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 5) return ctx.reply("That doesn't look like a phone number — try again (e.g. 0803...).");
      d.phone = text;
      s.step = "confirm";
      const cat = CATEGORIES.find(([, id]) => id === d.categoryId)?.[0];
      await ctx.reply(
        `Confirm request:\n• ${d.description}\n• ${cat}\n• ${d.address}${d.latitude ? "\n• 📍 GPS attached" : ""}\n• ${d.phone}\n\nReply YES to send, or ❌ Cancel.`,
        { reply_markup: cancelKb }
      );
    } else if (s.step === "confirm") {
      if (!/^yes$/i.test(text)) return ctx.reply("Reply YES to send, or ❌ Cancel.");
      try {
        const { request } = await api<{ request: { id: string } }>("/requests", {
          method: "POST",
          body: JSON.stringify({
            description: d.description,
            categoryId: d.categoryId,
            address: d.address,
            latitude: d.latitude !== undefined ? Number(d.latitude) : undefined,
            longitude: d.longitude !== undefined ? Number(d.longitude) : undefined,
            channel: "telegram",
            handle: String(ctx.chat?.id),
            name: d.phone,
          }),
        });
        const email = s.email;
        const isProvider = s.isProvider;
        ctx.session = { email, isProvider };
        await ctx.reply(
          `✅ Request received (ref \`${request.id.slice(0, 8)}\`). We'll message you when your provider is assigned.`,
          { reply_markup: menuKb(isProvider ?? false), parse_mode: "Markdown" }
        );
      } catch (e) {
        await ctx.reply(`Couldn't save: ${(e as Error).message}. Try again.`);
      }
    }
    return;
  }

  // ----- provider registration (no zone step — base GPS + radius) -----
  if (s.flow === "provider") {
    if (s.step === "name") {
      if (text.length < 2) return ctx.reply("Please type your full name.");
      d.name = text;
      s.step = "categories";
      await ctx.reply(
        "Which services? Reply with numbers like `1,3`, or names like `Plumbing, Cleaning`:\n" +
          CATEGORIES.map(([label], i) => `${i + 1}. ${label}`).join("\n"),
        { reply_markup: cancelKb, parse_mode: "Markdown" }
      );
    } else if (s.step === "categories") {
      const parts = text.split(",").map((n) => n.trim().toLowerCase()).filter(Boolean);
      const ids = parts
        .map((p) => {
          const byNum = CATEGORIES[Number(p) - 1]?.[1];
          if (byNum) return byNum;
          return CATEGORIES.find(([label, id]) => label.toLowerCase() === p || id === p)?.[1];
        })
        .filter(Boolean) as string[];
      if (!ids.length) return ctx.reply("I didn't catch that — numbers like `1,3`, or names.");
      d.categories = JSON.stringify(ids);
      s.step = "phone";
      await ctx.reply("Your phone number (customers reach you on it)?", {
        reply_markup: new Keyboard().requestContact("📱 Share my number").text("❌ Cancel").resized(),
      });
    } else if (s.step === "phone") {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 5) return ctx.reply("That doesn't look like a phone number — try again.");
      d.phone = text;
      s.step = "plocation";
      await ctx.reply("Share your base location 📍 — nearby jobs find you first. Or /skip.", {
        reply_markup: new Keyboard().requestLocation("📍 Share location").text("❌ Cancel").resized(),
      });
    } else if (s.step === "plocation") {
      if (text === "/skip") {
        s.step = "skill";
        await ctx.reply("Briefly describe your experience (or /skip).", { reply_markup: cancelKb });
      } else {
        return ctx.reply("Tap 📍 Share location, or /skip to continue.");
      }
    } else if (s.step === "skill") {
      if (/^\/skip$/i.test(text)) d.skillNote = "";
      else if (text.length < 3) return ctx.reply("A little more detail please (or /skip).");
      else d.skillNote = text;
      try {
        await api("/providers/provider-applications", {
          method: "POST",
          body: JSON.stringify({
            name: d.name,
            phone: d.phone,
            categories: JSON.parse(d.categories ?? "[]"),
            zones: ["general"],
            telegramChatId: String(ctx.chat?.id),
            latitude: d.latitude !== undefined ? Number(d.latitude) : undefined,
            longitude: d.longitude !== undefined ? Number(d.longitude) : undefined,
            skillNote: d.skillNote || undefined,
          }),
        });
        const email = s.email;
        ctx.session = { email, isProvider: s.isProvider };
        await ctx.reply("✅ Application received — under review. We'll message you here when approved.", {
          reply_markup: menuKb(s.isProvider ?? false),
        });
      } catch (e) {
        await ctx.reply(`Couldn't save: ${(e as Error).message}. Try again.`);
      }
    }
  }
});

bot.on("message:contact", async (ctx) => {
  const s = ctx.session;
  if (!s.email) return;
  if (s.flow === "request" && s.step === "phone") {
    (s.data ??= {}).phone = ctx.msg.contact.phone_number;
    s.step = "confirm";
    const d = s.data;
    await ctx.reply(
      `Confirm request:\n• ${d.description}\n• ${d.address}${d.latitude ? "\n• 📍 GPS attached" : ""}\n• ${d.phone}\n\nReply YES to send, or ❌ Cancel.`,
      { reply_markup: cancelKb }
    );
  } else if (s.flow === "provider" && s.step === "phone") {
    (s.data ??= {}).phone = ctx.msg.contact.phone_number;
    s.step = "plocation";
    await ctx.reply("Share your base location 📍 — nearby jobs find you first. Or /skip.", {
      reply_markup: new Keyboard().requestLocation("📍 Share location").text("❌ Cancel").resized(),
    });
  }
});

bot.on("message:location", async (ctx) => {
  const s = ctx.session;
  if (!s.email) return;
  const d = (s.data ??= {});
  const { latitude, longitude } = ctx.msg.location;
  if (s.flow === "request" && s.step === "location") {
    d.latitude = String(latitude);
    d.longitude = String(longitude);
    s.step = "phone";
    await ctx.reply("📍 Saved — closest providers rank first. Your phone number?", {
      reply_markup: new Keyboard().requestContact("📱 Share my number").text("❌ Cancel").resized(),
    });
  } else if (s.flow === "provider" && s.step === "plocation") {
    d.latitude = String(latitude);
    d.longitude = String(longitude);
    s.step = "skill";
    await ctx.reply("📍 Base saved. Briefly describe your experience (or /skip).", { reply_markup: cancelKb });
  }
});

// ---------- Match Confirm / Accept buttons ----------
bot.on("callback_query:data", async (ctx, next) => {
  const m = ctx.callbackQuery.data.match(/^jb:(.+):(customer|provider):(ok|no)$/);
  if (!m) return next();
  const [, jobId, role, verdict] = m;
  try {
    if (verdict === "ok") {
      await api(`/requests/jobs/${jobId}/transition`, {
        method: "POST",
        body: JSON.stringify({ to: "CONFIRMED", actor: role }),
      });
      await ctx.answerCallbackQuery(role === "provider" ? "Job accepted — customer notified." : "Confirmed — see you soon!");
      await ctx.editMessageText(
        role === "provider"
          ? "✅ You accepted this job. Please contact the customer promptly."
          : "✅ Booking confirmed. Your provider is on the way."
      );
    } else if (role === "provider") {
      await ctx.answerCallbackQuery("Declined — ServLink will reassign.");
      await ctx.editMessageText("❌ You declined this job. ServLink will reassign it.");
    } else {
      await api(`/requests/jobs/${jobId}/transition`, {
        method: "POST",
        body: JSON.stringify({ to: "CANCELLED", actor: "customer" }),
      });
      await ctx.answerCallbackQuery("Request cancelled.");
      await ctx.editMessageText("❌ Request cancelled. Tap 🛠 anytime to book again.");
    }
  } catch (e) {
    await ctx.answerCallbackQuery(`Error: ${(e as Error).message}`);
  }
});

// ---------- Follow-up YES/NO buttons ----------
bot.on("callback_query:data", async (ctx) => {
  const m = ctx.callbackQuery.data.match(/^fu:(.+):(yes|no)$/);
  if (!m) return;
  try {
    await api(`/jobs/followups/${m[1]}/respond`, {
      method: "POST",
      body: JSON.stringify({ confirmedOk: m[2] === "yes" }),
    });
    await ctx.answerCallbackQuery(m[2] === "yes" ? "Thanks — marked complete!" : "Sorry — rework opened, we'll be in touch.");
    await ctx.editMessageText(
      m[2] === "yes" ? "✅ You confirmed the work was done well. Thank you!" : "🔧 Rework requested — ServLink will follow up shortly."
    );
  } catch (e) {
    await ctx.answerCallbackQuery(`Error: ${(e as Error).message}`);
  }
});

// ---------- Concierge admin (founder only) ----------
function isAdmin(ctx: Ctx) {
  return ADMIN_IDS.includes(String(ctx.chat?.id));
}

bot.command("pending", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("Not for you 🙂");
  const { requests } = await api<{
    requests: Array<{ id: string; description: string; zoneId: string }>;
  }>("/requests?status=REQUESTED");
  if (!requests.length) return ctx.reply("Queue clear — nothing awaiting match.");
  await ctx.reply(
    requests.map((r) => `\`${r.id.slice(0, 8)}\` ${r.zoneId}: ${r.description.slice(0, 70)}`).join("\n"),
    { parse_mode: "Markdown" }
  );
});

bot.command("providers", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("Not for you 🙂");
  const { providers } = await api<{
    providers: Array<{ id: string; name: string; tier: string; isOnline: boolean }>;
  }>("/providers");
  if (!providers.length) return ctx.reply("No approved providers yet.");
  await ctx.reply(
    providers.map((p) => `\`${p.id.slice(0, 8)}\` ${p.name} (${p.tier}) ${p.isOnline ? "🟢" : "🔴"}`).join("\n"),
    { parse_mode: "Markdown" }
  );
});

bot.command("suggest", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("Not for you 🙂");
  const req8 = (ctx.match as string).trim();
  if (!req8) return ctx.reply("Usage: /suggest <requestRef>");
  try {
    const { requests } = await api<{ requests: Array<{ id: string }> }>("/requests?status=REQUESTED");
    const req = requests.find((r) => r.id.startsWith(req8));
    if (!req) return ctx.reply("Request ref not found — check /pending.");
    const { suggestions } = await api<{
      suggestions: Array<{ providerId: string; name: string; tier: string; score: number; distanceKm: number | null; reasons: string[] }>;
    }>(`/requests/${req.id}/suggestions`);
    if (!suggestions.length) return ctx.reply("No eligible (online) providers for this request.");
    await ctx.reply(
      suggestions
        .map((s) => {
          const dist = s.distanceKm === null ? "" : `, ${s.distanceKm.toFixed(1)} km`;
          return `\`${s.providerId.slice(0, 8)}\` ${s.name} (${s.tier}${dist}) — ${s.reasons.join(", ")}`;
        })
        .join("\n") + `\n\n/match ${req8} <providerRef>`,
      { parse_mode: "Markdown" }
    );
  } catch (e) {
    await ctx.reply(`Failed: ${(e as Error).message}`);
  }
});

bot.command("match", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("Not for you 🙂");
  const [req8, prov8] = (ctx.match as string).trim().split(/\s+/);
  if (!req8 || !prov8) return ctx.reply("Usage: /match <requestRef> <providerRef>");
  try {
    const { requests } = await api<{ requests: Array<{ id: string }> }>("/requests?status=REQUESTED");
    const { providers } = await api<{ providers: Array<{ id: string }> }>("/providers");
    const req = requests.find((r) => r.id.startsWith(req8));
    const prov = providers.find((p) => p.id.startsWith(prov8));
    if (!req || !prov) return ctx.reply("Ref not found — check /pending and /providers.");
    const { job } = await api<{ job: { id: string } }>(`/requests/${req.id}/match`, {
      method: "POST",
      body: JSON.stringify({ providerId: prov.id, matchedBy: "concierge" }),
    });
    await ctx.reply(`✅ Matched. Job \`${job.id.slice(0, 8)}\` — both sides notified with Confirm/Accept buttons.`, {
      parse_mode: "Markdown",
    });
  } catch (e) {
    await ctx.reply(`Match failed: ${(e as Error).message}`);
  }
});

bot.command("done", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("Not for you 🙂");
  const req8 = (ctx.match as string).trim();
  if (!req8) return ctx.reply("Usage: /done <requestRef>");
  try {
    const { requests } = await api<{
      requests: Array<{ id: string; jobs: Array<{ id: string }> }>;
    }>("/requests");
    const req = requests.find((r) => r.id.startsWith(req8));
    const jobId = req?.jobs.at(-1)?.id;
    if (!jobId) return ctx.reply("No job found for that ref.");
    await api(`/requests/jobs/${jobId}/transition`, {
      method: "POST",
      body: JSON.stringify({ to: "DONE_PENDING_CONFIRM", actor: "concierge" }),
    });
    await ctx.reply("Marked done — follow-up will go out shortly.");
  } catch (e) {
    await ctx.reply(`Failed: ${(e as Error).message}`);
  }
});

bot.catch((err) => console.error("[bot]", err));
bot.start();
console.log("telegram-bot polling");
