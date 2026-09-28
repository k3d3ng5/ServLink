import { Router } from "express";
import { db } from "../db.js";
import { ApplicationSchema, ReviewSchema } from "../schemas.js";

export const providers = Router();

// GET /providers?categoryId=&zoneId= — rule-based candidate list (Phase 7 ranks).
providers.get("/", async (req, res, next) => {
  try {
    const { categoryId, zoneId } = req.query as Record<string, string | undefined>;
    const all = await db.provider.findMany({ orderBy: { createdAt: "asc" } });
    const list = all.filter((p) => {
      const cats: string[] = JSON.parse(p.categories || "[]");
      const zones: string[] = JSON.parse(p.zones || "[]");
      if (categoryId && !cats.includes(categoryId)) return false;
      if (zoneId && !zones.includes(zoneId)) return false;
      return true;
    });
    res.json({ providers: list });
  } catch (err) {
    next(err);
  }
});

// POST /provider-applications — provider self-registration.
providers.post("/provider-applications", async (req, res, next) => {
  try {
    const body = ApplicationSchema.parse(req.body);
    const app = await db.providerApplication.create({
      data: {
        name: body.name,
        phone: body.phone,
        categories: JSON.stringify(body.categories),
        zones: JSON.stringify(body.zones),
        telegramChatId: body.telegramChatId,
        skillNote: body.skillNote,
        photoUrl: body.photoUrl,
      },
    });
    res.status(201).json({ application: app });
  } catch (err) {
    next(err);
  }
});

// GET /provider-applications?status=pending — console inbox.
providers.get("/provider-applications", async (req, res, next) => {
  try {
    const status = (req.query.status as string) || "pending";
    const apps = await db.providerApplication.findMany({
      where: { status },
      orderBy: { createdAt: "asc" },
    });
    res.json({ applications: apps });
  } catch (err) {
    next(err);
  }
});

// POST /provider-applications/:id/review — approve creates the provider row.
providers.post("/provider-applications/:id/review", async (req, res, next) => {
  try {
    const body = ReviewSchema.parse(req.body);
    const app = await db.providerApplication.findUnique({ where: { id: req.params.id } });
    if (!app) return res.status(404).json({ error: "not found" });
    if (body.decision === "approve") {
      const provider = await db.provider.create({
        data: {
          name: app.name,
          phone: app.phone,
          categories: app.categories,
          zones: app.zones,
          tier: "Basic",
          verificationStatus: "phone_verified",
        },
      });
      await db.providerApplication.update({
        where: { id: app.id },
        data: { status: "approved", reviewedBy: body.reviewedBy },
      });
      return res.json({ provider });
    }
    await db.providerApplication.update({
      where: { id: app.id },
      data: { status: "rejected", reviewedBy: body.reviewedBy },
    });
    res.json({ rejected: true });
  } catch (err) {
    next(err);
  }
});
