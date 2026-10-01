import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { dispatchNext } from "../dispatch.js";
import {
  initializePayment,
  naira,
  paystackConfigured,
  verifyPayment,
} from "../paystack.js";
import { send } from "../notify.js";
import {
  FollowUpResponseSchema,
  FollowUpSchema,
  RateSchema,
  ReworkSchema,
} from "../schemas.js";
import { applyTransition } from "../transitions.js";

export const jobs = Router();

// POST /jobs/:id/quote { amountKobo, actor } — agree the price (concierge/provider).
jobs.post("/:id/quote", async (req, res, next) => {
  try {
    const body = z
      .object({ amountKobo: z.number().int().min(100), actor: z.string().max(100).default("concierge") })
      .parse(req.body);
    const job = await db.job.update({
      where: { id: req.params.id },
      data: { amountKobo: body.amountKobo },
      include: { request: true },
    });
    await db.statusEvent.create({
      data: {
        requestId: job.requestId,
        fromStatus: job.request.status,
        toStatus: job.request.status,
        actor: body.actor,
        note: `quoted ${naira(body.amountKobo)}`,
      },
    });
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/pay-init — create the Paystack payment + send the customer a pay link.
jobs.post("/:id/pay-init", async (req, res, next) => {
  try {
    if (!paystackConfigured()) return res.status(503).json({ error: "paystack not configured" });
    const job = await db.job.findUnique({
      where: { id: req.params.id },
      include: { request: { include: { customer: true } } },
    });
    if (!job) return res.status(404).json({ error: "not found" });
    if (!job.amountKobo) return res.status(422).json({ error: "quote first (POST /jobs/:id/quote)" });
    const email = job.request.customer.email;
    if (!email) return res.status(422).json({ error: "customer has no email for receipt" });

    const init = await initializePayment(email, job.amountKobo);
    await db.job.update({
      where: { id: job.id },
      data: { paystackRef: init.reference, paymentStatus: "pending" },
    });
    const to =
      (job.request.sourceChannel === "telegram"
        ? job.request.customer.handle
        : job.request.customer.email ?? job.request.customer.handle) ?? "";
    if (to && job.request.sourceChannel === "telegram" && process.env.TELEGRAM_BOT_TOKEN) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: to,
          text: `💳 ServLink payment: ${naira(job.amountKobo)} for job \`${job.id.slice(0, 8)}\`. Tap below to pay securely via Paystack.`,
          reply_markup: { inline_keyboard: [[{ text: `Pay ${naira(job.amountKobo)}`, url: init.authorization_url }]] },
        }),
      });
    }
    res.json({ authorization_url: init.authorization_url, reference: init.reference });
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/pay-verify — confirm payment on demand (works on localhost, no webhook needed).
jobs.post("/:id/pay-verify", async (req, res, next) => {
  try {
    const job = await db.job.findUnique({ where: { id: req.params.id } });
    if (!job?.paystackRef) return res.status(422).json({ error: "no payment initialized" });
    const { settleByReference } = await import("./webhooks.js");
    const result = await settleByReference(job.paystackRef);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/accept { actor: customer|provider } — offer accepted, job confirmed.
jobs.post("/:id/accept", async (req, res, next) => {
  try {
    const { actor } = z.object({ actor: z.enum(["customer", "provider"]) }).parse(req.body);
    await db.jobOffer.updateMany({
      where: { jobId: req.params.id, status: "pending" },
      data: { status: "accepted" },
    });
    const result = await applyTransition(req.params.id, "CONFIRMED", actor);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/decline { actor } — provider decline auto-escalates to the next
// suggestion; customer decline cancels. The founder is only pinged when automation
// runs out of providers.
jobs.post("/:id/decline", async (req, res, next) => {
  try {
    const { actor } = z.object({ actor: z.enum(["customer", "provider"]) }).parse(req.body);
    await db.jobOffer.updateMany({
      where: { jobId: req.params.id, status: "pending" },
      data: { status: "declined" },
    });
    if (actor === "customer") {
      const result = await applyTransition(req.params.id, "CANCELLED", "customer");
      return res.json(result);
    }
    const job = await db.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: "not found" });
    const nextJob = await dispatchNext(job.requestId);
    res.json({ escalatedTo: nextJob?.id ?? null });
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/followup — manual follow-up prompt (worker also calls this path).
jobs.post("/:id/followup", async (req, res, next) => {
  try {
    const body = FollowUpSchema.parse(req.body);
    const job = await db.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: "not found" });
    const followUp = await db.followUp.create({
      data: { jobId: job.id, channel: body.channel },
    });
    res.status(201).json({ followUp });
  } catch (err) {
    next(err);
  }
});

// POST /followups/:id/respond — YES (COMPLETED) or NO (REWORK_REQUESTED).
jobs.post("/followups/:id/respond", async (req, res, next) => {
  try {
    const body = FollowUpResponseSchema.parse(req.body);
    const followUp = await db.followUp.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!followUp) return res.status(404).json({ error: "not found" });
    await db.followUp.update({
      where: { id: followUp.id },
      data: { response: body.response ?? (body.confirmedOk ? "YES" : "NO"), confirmedOk: body.confirmedOk },
    });
    const result = await applyTransition(
      followUp.jobId,
      body.confirmedOk ? "COMPLETED" : "REWORK_REQUESTED",
      "customer",
      body.response
    );
    res.json({ followUpId: followUp.id, ...result });
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/rate — 1–5 tied to a real job.
jobs.post("/:id/rate", async (req, res, next) => {
  try {
    const body = RateSchema.parse(req.body);
    const rating = await db.rating.create({
      data: { jobId: req.params.id, score: body.score, note: body.note },
    });
    res.status(201).json({ rating });
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/rework — open a rework ticket (also moves state).
jobs.post("/:id/rework", async (req, res, next) => {
  try {
    const body = ReworkSchema.parse(req.body);
    const ticket = await db.reworkTicket.create({
      data: { jobId: req.params.id, reason: body.reason },
    });
    let transition: unknown = null;
    try {
      transition = await applyTransition(req.params.id, "REWORK_REQUESTED", "customer", body.reason);
    } catch {
      // already in rework — ticket alone is fine
    }
    res.status(201).json({ ticket, transition });
  } catch (err) {
    next(err);
  }
});
