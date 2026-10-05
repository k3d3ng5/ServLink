import { Router } from "express";
import { db } from "../db.js";
import { createMatch, dispatchNext } from "../dispatch.js";
import { hasCoords, nearestZone } from "../geo.js";
import { suggestProviders } from "../matching.js";
import { notifyAdmins } from "../notify.js";
import { IntakeSchema, MatchSchema, TransitionSchema } from "../schemas.js";
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
    const zoneId =
      body.zoneId ??
      (body.latitude !== undefined && body.longitude !== undefined
        ? nearestZone({ latitude: body.latitude, longitude: body.longitude })
        : "general");
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
        zoneId,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
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
      `🆕 New request \`${request.id.slice(0, 8)}\` (${zoneId}): ${body.description.slice(0, 100)}`
    );
    // Automatic dispatch: offer to the closest online provider now.
    // Manual /match stays as the override. Dispatch never blocks intake.
    dispatchNext(request.id).catch((e) => console.error("[dispatch]", e));
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
    // Privacy: provider contact (phone/chat/email) is revealed only once both
    // sides are committed (CONFIRMED+). Before that: assignment without contact.
    const revealed = ["CONFIRMED", "IN_PROGRESS", "DONE_PENDING_CONFIRM", "FOLLOW_UP_SENT", "COMPLETED", "REWORK_REQUESTED"].includes(request.status);
    const { phone: _cp, telegramChatId: _cc, ...safeCustomer } = request.customer;
    const safe = {
      ...request,
      customer: safeCustomer,
      jobs: request.jobs.map((j) => {
        if (revealed) return j;
        const { phone: _pp, telegramChatId: _pc, email: _pe, ...safeProvider } = j.provider;
        return { ...j, provider: safeProvider };
      }),
    };
    res.json({ request: safe });
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

// POST /requests/:id/match — manual assign (concierge/console). Same engine as auto-dispatch.
requests.post("/:id/match", async (req, res, next) => {
  try {
    const body = MatchSchema.parse(req.body);
    const { job } = await createMatch(req.params.id, body.providerId, body.matchedBy);
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});

// POST /requests/:id/dispatch — trigger (or retry) automatic dispatch.
requests.post("/:id/dispatch", async (req, res, next) => {
  try {
    const job = await dispatchNext(req.params.id);
    res.json({ job });
  } catch (err) {
    next(err);
  }
});
// POST /jobs/:id/transition — guarded lifecycle step.
requests.post("/jobs/:id/transition", async (req, res, next) => {
  try {
    const body = TransitionSchema.parse(req.body);
    const result = await applyTransition(req.params.id, body.to as never, body.actor, body.note);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
