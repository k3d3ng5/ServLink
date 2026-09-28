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
const ZONES = ["Gwarinpa", "Wuse 2", "Jabi", "Maitama", "Asokoro"];
const ZONE_IDS = ["gwarinpa", "wuse-2", "jabi", "maitama", "asokoro"];

interface Draft {
  flow?: "request" | "provider";
  step?: string;
  data?: Record<string, string>;
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
const menuKb = new Keyboard()
  .text("🛠 New service request")
  .text("🧰 Register as provider")
  .row()
  .text("📦 My status")
  .resized();

bot.command("start", async (ctx) => {
  ctx.session = {};
  await ctx.reply(
    "Welcome to ServLink.\n\n🛠 *New service request* — tell me what's broken, get a vetted provider.\n🧰 *Register as provider* — join and receive jobs.\n📦 *My status* — track your requests.",
    { reply_markup: menuKb, parse_mode: "Markdown" }
  );
});

bot.hears("❌ Cancel", async (ctx) => {
  ctx.session = {};
  await ctx.reply("Cancelled. What next?", { reply_markup: menuKb });
});

// ---------- Customer: new request wizard ----------
bot.hears("🛠 New service request", async (ctx) => {
  ctx.session = { flow: "request", step: "description", data: {} };
  await ctx.reply("What needs doing? Describe it briefly (e.g. *Kitchen sink leaking*).", {
    reply_markup: cancelKb,
    parse_mode: "Markdown",
  });
});

// ---------- Provider: registration wizard ----------
bot.hears("🧰 Register as provider", async (ctx) => {
  ctx.session = { flow: "provider", step: "name", data: {} };
  await ctx.reply("Great — let's get you earning. What's your *full name*?", {
    reply_markup: cancelKb,
    parse_mode: "Markdown",
  });
});

// ---------- Status ----------
bot.hears("📦 My status", async (ctx) => {
  const chatId = String(ctx.chat?.id);
  try {
    const { requests } = await api<{
      requests: Array<{ id: string; description: string; status: string }>;
    }>(`/requests?channel=telegram&handle=${encodeURIComponent(chatId)}`);
    if (!requests.length) {
      await ctx.reply("No requests yet. Tap 🛠 to create one.", { reply_markup: menuKb });
      return;
    }
    const lines = requests
      .slice(-5)
      .map((r) => `• ${r.description.slice(0, 60)} — *${r.status}* (ref \`${r.id.slice(0, 8)}\`)`);
    await ctx.reply(`Your recent requests:\n${lines.join("\n")}`, {
      reply_markup: menuKb,
      parse_mode: "Markdown",
    });
  } catch (e) {
    await ctx.reply(`Couldn't load status: ${(e as Error).message}`, { reply_markup: menuKb });
  }
});

bot.on("message:text", async (ctx, next) => {
  const s = ctx.session;
  if (!s.flow) return next();
  const text = ctx.msg.text.trim();
  const d = (s.data ??= {});

  if (s.flow === "request") {
    if (s.step === "description") {
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
      s.step = "zone";
      await ctx.reply("Which area?", {
        reply_markup: Keyboard.from(ZONES.map((z) => [z])).resized(),
      });
    } else if (s.step === "zone") {
      const i = ZONES.indexOf(text);
      if (i < 0) return ctx.reply("Please pick one of the listed areas.");
      d.zoneId = ZONE_IDS[i];
      s.step = "address";
      await ctx.reply("Street address / landmark?", { reply_markup: cancelKb });
    } else if (s.step === "address") {
      d.address = text;
      s.step = "phone";
      await ctx.reply("Your phone number? (we'll call about the job)", {
        reply_markup: new Keyboard().requestContact("📱 Share my number").text("❌ Cancel").resized(),
      });
    } else if (s.step === "phone") {
      d.phone = text;
      s.step = "confirm";
      const cat = CATEGORIES.find(([, id]) => id === d.categoryId)?.[0];
      await ctx.reply(
        `Confirm request:\n• ${d.description}\n• ${cat} — ${d.zoneId}\n• ${d.address}\n• ${d.phone}\n\nReply YES to send, or ❌ Cancel.`,
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
            zoneId: d.zoneId,
            address: d.address,
            channel: "telegram",
            handle: String(ctx.chat?.id),
            name: d.phone,
          }),
        });
        ctx.session = {};
        await ctx.reply(
          `✅ Request received (ref \`${request.id.slice(0, 8)}\`). We'll message you when your provider is assigned.`,
          { reply_markup: menuKb, parse_mode: "Markdown" }
        );
      } catch (e) {
        await ctx.reply(`Couldn't save: ${(e as Error).message}. Try again.`);
      }
    }
    return;
  }

  if (s.flow === "provider") {
    if (s.step === "name") {
      d.name = text;
      s.step = "categories";
      await ctx.reply(
        "Which services? Reply with numbers, comma-separated:\n" +
          CATEGORIES.map(([label], i) => `${i + 1}. ${label}`).join("\n")
      );
    } else if (s.step === "categories") {
      const ids = text
        .split(",")
        .map((n) => CATEGORIES[Number(n.trim()) - 1]?.[1])
        .filter(Boolean) as string[];
      if (!ids.length) return ctx.reply("No valid numbers — try like `1,3`.");
      d.categories = JSON.stringify(ids);
      s.step = "zones";
      await ctx.reply(
        "Which areas? Numbers, comma-separated:\n" +
          ZONES.map((z, i) => `${i + 1}. ${z}`).join("\n")
      );
    } else if (s.step === "zones") {
      const ids = text
        .split(",")
        .map((n) => ZONE_IDS[Number(n.trim()) - 1])
        .filter(Boolean);
      if (!ids.length) return ctx.reply("No valid numbers — try like `1,2`.");
      d.zones = JSON.stringify(ids);
      s.step = "phone";
      await ctx.reply("Your phone number (customers will reach you on it)?", {
        reply_markup: new Keyboard().requestContact("📱 Share my number").text("❌ Cancel").resized(),
      });
    } else if (s.step === "phone") {
      d.phone = text;
      s.step = "skill";
      await ctx.reply("Briefly describe your experience (or /skip).", {
        reply_markup: cancelKb,
      });
    } else if (s.step === "skill") {
      d.skillNote = text === "/skip" ? "" : text;
      try {
        await api("/providers/provider-applications", {
          method: "POST",
          body: JSON.stringify({
            name: d.name,
            phone: d.phone,
            categories: JSON.parse(d.categories ?? "[]"),
            zones: JSON.parse(d.zones ?? "[]"),
            telegramChatId: String(ctx.chat?.id),
            skillNote: d.skillNote || undefined,
          }),
        });
        ctx.session = {};
        await ctx.reply(
          "✅ Application received — we're reviewing it and will message you here when approved. Welcome aboard.",
          { reply_markup: menuKb }
        );
      } catch (e) {
        await ctx.reply(`Couldn't save: ${(e as Error).message}. Try again.`);
      }
    }
  }
});

bot.on("message:contact", async (ctx) => {
  const s = ctx.session;
  if (s.flow === "request" && s.step === "phone") {
    (s.data ??= {}).phone = ctx.msg.contact.phone_number;
    s.step = "confirm";
    const d = s.data;
    await ctx.reply(
      `Confirm request:\n• ${d.description}\n• ${d.zoneId}\n• ${d.address}\n• ${d.phone}\n\nReply YES to send, or ❌ Cancel.`,
      { reply_markup: cancelKb }
    );
  } else if (s.flow === "provider" && s.step === "phone") {
    (s.data ??= {}).phone = ctx.msg.contact.phone_number;
    s.step = "skill";
    await ctx.reply("Briefly describe your experience (or /skip).", { reply_markup: cancelKb });
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
    await ctx.answerCallbackQuery(
      m[2] === "yes" ? "Thanks — marked complete!" : "Sorry to hear — rework opened, we'll be in touch."
    );
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
    requests
      .map((r) => `\`${r.id.slice(0, 8)}\` ${r.zoneId}: ${r.description.slice(0, 70)}`)
      .join("\n"),
    { parse_mode: "Markdown" }
  );
});

bot.command("providers", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("Not for you 🙂");
  const { providers } = await api<{
    providers: Array<{ id: string; name: string; tier: string }>;
  }>("/providers");
  if (!providers.length) return ctx.reply("No approved providers yet.");
  await ctx.reply(providers.map((p) => `\`${p.id.slice(0, 8)}\` ${p.name} (${p.tier})`).join("\n"), {
    parse_mode: "Markdown",
  });
});

bot.command("match", async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply("Not for you 🙂");
  const [req8, prov8] = (ctx.match as string).trim().split(/\s+/);
  if (!req8 || !prov8) return ctx.reply("Usage: /match <requestRef> <providerRef>");
  try {
    const { requests } = await api<{ requests: Array<{ id: string }> }>(
      "/requests?status=REQUESTED"
    );
    const { providers } = await api<{ providers: Array<{ id: string }> }>("/providers");
    const req = requests.find((r) => r.id.startsWith(req8));
    const prov = providers.find((p) => p.id.startsWith(prov8));
    if (!req || !prov) return ctx.reply("Ref not found — check /pending and /providers.");
    const { job } = await api<{ job: { id: string } }>(`/requests/${req.id}/match`, {
      method: "POST",
      body: JSON.stringify({ providerId: prov.id, matchedBy: "concierge" }),
    });
    await ctx.reply(`✅ Matched. Job \`${job.id.slice(0, 8)}\` — customer has been notified.`, {
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
