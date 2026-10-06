import nodemailer from "nodemailer";

// Outbound mail chain (first configured sender wins):
//  1. Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD) — free, personal address,
//     works for any recipient. Pilot default until the domain lands.
//  2. Resend (RESEND_API_KEY) — takes over once a domain is verified.
//  3. Server log — dev only, never production.

function gmailTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || user.includes("change_me") || pass.includes("change_me")) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendMail(to: string, subject: string, text: string): Promise<{ via: string; ok: boolean }> {
  const gmail = gmailTransport();
  if (gmail) {
    try {
      await gmail.sendMail({ from: process.env.GMAIL_USER, to, subject, text });
      console.log(`[mail] gmail -> ${to} ok=true`);
      return { via: "gmail", ok: true };
    } catch (e) {
      console.log(`[mail] gmail failed: ${(e as Error).message.slice(0, 160)}`);
    }
  }
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "ServLink <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
    console.log(`[mail] resend -> ${to} ok=${res.ok}`);
    if (!res.ok) console.log(`[mail] resend error: ${(await res.text()).slice(0, 200)}`);
    return { via: "resend", ok: res.ok };
  }
  console.log(`[mail] (no sender configured, logged) -> ${to}: ${subject}`);
  return { via: "log", ok: false };
}
