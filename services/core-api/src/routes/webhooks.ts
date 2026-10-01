import { Router } from "express";
import { db } from "../db.js";
import { send } from "../notify.js";
import { validWebhookSignature, verifyPayment } from "../paystack.js";

export const webhooks = Router();

// POST /webhooks/paystack — charge.success (and friends). Needs tunnel URL in
// Paystack dashboard for live delivery; on-demand /pay-verify covers localhost.
webhooks.post("/paystack", async (req, res) => {
  try {
    const raw = (req as unknown as { rawBody?: string }).rawBody ?? "";
    const sig = req.headers["x-paystack-signature"] as string | undefined;
    if (!validWebhookSignature(raw, sig)) return res.status(401).json({ error: "bad signature" });

    const event = (req.body ?? {}) as { event?: string; data?: { reference?: string } };
    const reference = event.data?.reference;
    if (event.event === "charge.success" && reference) {
      await settleByReference(reference);
    }
    res.json({ received: true });
  } catch (err) {
    console.error("[webhook]", err);
    res.status(500).json({ error: "webhook failed" });
  }
});

export async function settleByReference(reference: string) {
  const verified = await verifyPayment(reference);
  if (verified.status !== "success") {
    await db.job.updateMany({
      where: { paystackRef: reference },
      data: { paymentStatus: "failed" },
    });
    return { paid: false };
  }
  const jobs = await db.job.findMany({
    where: { paystackRef: reference },
    include: { request: { include: { customer: true } } },
  });
  for (const job of jobs) {
    await db.job.update({
      where: { id: job.id },
      data: { paymentStatus: "paid", paidAt: new Date(verified.paidAt ?? Date.now()) },
    });
    const to =
      (job.request.sourceChannel === "telegram"
        ? job.request.customer.handle
        : job.request.customer.email ?? job.request.customer.handle) ?? "";
    if (to) {
      await send({
        to,
        kind: job.request.sourceChannel === "telegram" ? "telegram" : "push",
        text: `🧾 ServLink receipt: payment of job \`${job.id.slice(0, 8)}\` confirmed. Thank you!`,
        meta: { jobId: job.id },
      });
    }
  }
  return { paid: true, count: jobs.length };
}
