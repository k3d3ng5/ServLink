import { createHmac } from "node:crypto";

// Paystack wrapper (test mode for pilot). Key lives in PAYSTACK_SECRET_KEY.
// Two confirmation paths (local-first friendly):
//  1. Webhook POST /webhooks/paystack (needs public URL via tunnel in production).
//  2. On-demand verify GET /transaction/verify/:reference (works on localhost).
const BASE = "https://api.paystack.co";
const key = () => process.env.PAYSTACK_SECRET_KEY ?? "";

export function paystackConfigured(): boolean {
  const k = key();
  return Boolean(k) && !k.includes("change_me");
}

export interface PayInit {
  authorization_url: string;
  reference: string;
}

export async function initializePayment(email: string, amountKobo: number): Promise<PayInit> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: { authorization: `Bearer ${key()}`, "content-type": "application/json" },
    body: JSON.stringify({ email, amount: amountKobo }),
  });
  const body = (await res.json()) as { status: boolean; message: string; data?: PayInit };
  if (!res.ok || !body.status || !body.data) {
    throw new Error(`paystack init failed: ${body.message ?? res.status}`);
  }
  return body.data;
}

export interface PayVerify {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  paidAt: string | null;
}

export async function verifyPayment(reference: string): Promise<PayVerify> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { authorization: `Bearer ${key()}` },
  });
  const body = (await res.json()) as {
    status: boolean;
    message: string;
    data?: { status: string; reference: string; amount: number; paid_at: string | null };
  };
  if (!res.ok || !body.status || !body.data) {
    throw new Error(`paystack verify failed: ${body.message ?? res.status}`);
  }
  const d = body.data;
  return {
    status: d.status === "success" ? "success" : d.status === "abandoned" ? "abandoned" : "failed",
    reference: d.reference,
    amount: d.amount,
    paidAt: d.paid_at,
  };
}

// Webhook authenticity: HMAC-SHA512 of the raw body with the secret key.
export function validWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  if (!signature || !paystackConfigured()) return false;
  const digest = createHmac("sha512", key()).update(rawBody).digest("hex");
  return digest === signature;
}

export function naira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}
