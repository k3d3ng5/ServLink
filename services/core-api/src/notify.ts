// Notification router: picks channel per recipient, logs every send.
// Telegram via Bot API, email via Resend, push via log driver (Expo in Phase 4).
export interface SendInput {
  to: string;
  kind: "telegram" | "email" | "push";
  text: string;
  meta?: Record<string, string>;
}

export async function send(input: SendInput): Promise<{ delivered: boolean; via: string }> {  const { to, kind, text } = input;
  if (kind === "telegram" && process.env.TELEGRAM_BOT_TOKEN) {
    const body: Record<string, unknown> = { chat_id: to, text };
    // Follow-up prompts get YES/NO buttons carrying the followUpId back.
    if (input.meta?.followUpId) {
      body.reply_markup = {
        inline_keyboard: [
          [
            { text: "✅ YES, done well", callback_data: `fu:${input.meta.followUpId}:yes` },
            { text: "❌ NO, needs rework", callback_data: `fu:${input.meta.followUpId}:no` },
          ],
        ],
      };
    }
    const res = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    console.log(`[notify] telegram -> ${to} ok=${res.ok}`);
    return { delivered: res.ok, via: "telegram" };
  }
  if (kind === "email" && process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "ServLink <noreply@servlink.app>",
        to: [to],
        subject: "ServLink update",
        text,
      }),
    });
    console.log(`[notify] email -> ${to} ok=${res.ok}`);
    return { delivered: res.ok, via: "email" };
  }
  console.log(`[notify] (${kind} unconfigured, logged) -> ${to}: ${text.slice(0, 120)}`);
  return { delivered: false, via: "log" };
}

// Founder alerts: new requests + new applications go straight to admin Telegram.
export async function notifyAdmins(text: string): Promise<void> {
  const ids = (process.env.ADMIN_CHAT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const id of ids) {
    try {
      await send({ to: id, kind: "telegram", text });
    } catch (err) {
      console.error("[notify-admin]", err);
    }
  }
}
