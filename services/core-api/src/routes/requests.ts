import { Router } from "express";
import { db } from "../db.js";
import { suggestProviders } from "../matching.js";
import { notifyAdmins, send } from "../notify.js";
import { IntakeSchema, MatchSchema } from "../schemas.js";
import { applyTransition } from "../transitions.js";

export const requests = Router();

// GET /requests?status=&channel=&handle= — queues for bot + console.
requests.get("/", async (req, res, next) => {
  try {
    const { status, channel, handle } = req.query as Record<string, string | undefined>;
    const list = await db.serviceRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(channel && handle
          ? { sourceChannel: channel, customer: { handle } }
          : {}),
      },
      include: { customer: true, jobs: { include: { provider: true } } },
      orderBy: { createdAt: "asc" },
      take: 50,
    });
    res.json({ requests: list });
  } catch (err) {
    next(err);
  }
});

// POST /requests — intake from any channel (already normalized by adapter).
requests.post("/", async (req, res, next) => {
  try {
    const body = IntakeSchema.parse(req.body);
    const customer = await db.customer.upsert({
      where: body.email
        ? { email: body.email }
        : { phone: `__${body.channel}:${body.handle}` },
      update: { name: body.name, handle: body.handle },
      create: {
        phone: body.email ? undefined : `__${body.channel}:${body.handle}`,
        email: body.email,
        name: body.name,
        channel: body.channel,
        handle: body.handle,
      },
    });
    const request = await db.serviceRequest.create({
      data: {
        customerId: customer.id,
        categoryId: body.categoryId,
        zoneId: body.zoneId,
        address: body.address,
        description: body.description,
        preferredTime: body.preferredTime,
        sourceChannel: body.channel,
        status: "REQUESTED",
      },
    });
    await db.statusEvent.create({
      data: {
        requestId: request.id,
        fromStatus: "REQUESTED",
        toStatus: "REQUESTED",
        actor: `${body.channel}:${body.handle}`,
        note: "intake",
      },
    });
    await notifyAdmins(
      `🆕 New request \`${request.id.slice(0, 8)}\` (${body.zoneId}): ${body.description.slice(0, 100)}`
    );
    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
});

// GET /requests/:id — full lifecycle view.
requests.get("/:id", async (req, res, next) => {
  try {
    const request = await db.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        jobs: { include: { provider: true, followUps: true, ratings: true, reworks: true } },
        events: { orderBy: { at: "asc" } },
      },
    });
    if (!request) return res.status(404).json({ error: "not found" });
    res.json({ request });
  } catch (err) {
    next(err);
  }
});

// GET /requests/:id/suggestions — ranked provider candidates (rule-based v1).
requests.get("/:id/suggestions", async (req, res, next) => {
  try {
    const suggestions = await suggestProviders(req.params.id);
    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
});

// POST /requests/:id/match — concierge assigns a provider.
requests.post("/:id/match", async (req, res, next) => {
  try {
    const body = MatchSchema.parse(req.body);
    const request = await db.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: { customer: true },
    });
    if (!request) return res.status(404).json({ error: "not found" });
    if (request.status !== "REQUESTED") {
      return res.status(422).json({ error: `request is ${request.status}, expected REQUESTED` });
    }
    const provider = await db.provider.findUnique({ where: { id: body.providerId } });
    if (!provider) return res.status(404).json({ error: "provider not found" });

    const job = await db.job.create({
      data: { requestId: request.id, providerId: provider.id, matchedBy: body.matchedBy },
    });
    await db.serviceRequest.update({
      where: { id: request.id },
      data: { status: "MATCHED" },
    });
    await db.statusEvent.create({
      data: {
        requestId: request.id,
        fromStatus: "REQUESTED",
        toStatus: "MATCHED",
        actor: body.matchedBy,
        note: `provider ${provider.name}`,
      },
    });

    const to =
      (request.sourceChannel === "telegram"
        ? request.customer.handle
        : request.customer.email ?? request.customer.handle) ?? "";
    await send({
      to,
      kind: request.sourceChannel === "telegram" ? "telegram" : "push",
      text: `ServLink: ${provider.name} is assigned to your request (${request.description.slice(0, 80)}). Ref ${job.id.slice(0, 8)}.`,
      meta: { jobId: job.id },
    });
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/transition — guarded lifecycle step.
requests.post("/jobs/:id/transition", async (req, res, next) => {
  try {
    const { TransitionSchema } = await import("../schemas.js");
    const body = TransitionSchema.parse(req.body);
    const result = await applyTransition(req.params.id, body.to as never, body.actor, body.note);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
