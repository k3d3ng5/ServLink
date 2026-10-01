import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { notifyAdmins } from "../notify.js";
import { ApplicationSchema, ReviewSchema } from "../schemas.js";

export const providers = Router();

// GET /providers?categoryId=&zoneId= — rule-based candidate list (Phase 7 ranks).
// Online-only when ?onlineOnly=true (provider availability gate).
providers.get("/", async (req, res, next) => {
  try {
    const { categoryId, zoneId, onlineOnly } = req.query as Record<string, string | undefined>;
    const all = await db.provider.findMany({
      orderBy: { createdAt: "asc" },
      include: { jobs: true },
    });
    const list = all
      .filter((p) => {
        const cats: string[] = JSON.parse(p.categories || "[]");
        const zones: string[] = JSON.parse(p.zones || "[]");
        if (categoryId && !cats.includes(categoryId)) return false;
        if (zoneId && zoneId !== "general" && !zones.includes(zoneId)) return false;
        if (onlineOnly === "true" && !p.isOnline) return false;
        return true;
      })
      .map(({ jobs, ...p }) => p);
    res.json({ providers: list });
  } catch (err) {
    next(err);
  }
});

// GET /providers/me?chatId= or ?email= — provider record for a chat or login.
providers.get("/me", async (req, res, next) => {
  try {
    const { chatId, email } = req.query as Record<string, string | undefined>;
    if (!chatId && !email) return res.status(400).json({ error: "chatId or email required" });
    const provider = await db.provider.findFirst({
      where: chatId ? { telegramChatId: chatId } : { email },
      include: { jobs: { include: { request: true }, orderBy: { matchedAt: "desc" }, take: 10 } },
    });
    if (!provider) return res.status(404).json({ error: "no provider for this identity" });
    res.json({ provider });
  } catch (err) {
    next(err);
  }
});

// POST /providers/:id/online { online } — availability toggle.
providers.post("/:id/online", async (req, res, next) => {
  try {
    const { online } = z.object({ online: z.boolean() }).parse(req.body);
    const provider = await db.provider.update({
      where: { id: req.params.id },
      data: { isOnline: online },
    });
    res.json({ provider });
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
        email: body.email,
        nin: body.nin,
        idType: body.idType,
        photoUrl: body.photoUrl,
        latitude: body.latitude,
        longitude: body.longitude,
        skillNote: body.skillNote,
      },
    });
    // Automated ID gate: valid 11-digit NIN + ID document photo auto-approves
    // to Basic. Either missing → human review. True identity verification
    // (licensed vendor) upgrades to Verified later.
    // NOTE: raw NIN is held only for verification and never returned by any API.
    let autoApproved: { id: string } | null = null;
    if (body.nin && /^\d{11}$/.test(body.nin) && body.photoUrl) {
      try {
        autoApproved = await db.provider.create({
          data: {
            name: body.name,
            phone: body.phone,
            email: body.email,
            ninLast4: body.nin.slice(-4),
            ninVerified: false,
            telegramChatId: body.telegramChatId,
            latitude: body.latitude,
            longitude: body.longitude,
            categories: JSON.stringify(body.categories),
            zones: JSON.stringify(body.zones),
            tier: "Basic",
            verificationStatus: "nin_format_checked",
          },
        });
        await db.providerApplication.update({
          where: { id: app.id },
          data: { status: "approved", reviewedBy: "system-nin-format" },
        });
      } catch {
        // e.g. duplicate phone — falls back to human review, never crashes intake
      }
    }
    await notifyAdmins(`🧰 New provider application: ${body.name} (${body.phone})`);
    res.status(201).json({
      application: app,
      autoApproved: autoApproved ? { providerId: autoApproved.id } : null,
    });
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

// GET /provider-applications/:id/id-photo — streams the ID doc.
// Storage model (pilot): the Telegram file vault. photoUrl "tg:<file_id>"
// is resolved via Bot API getFile and proxied. R2 migration = change this
// function only; callers keep working.
providers.get("/provider-applications/:id/id-photo", async (req, res, next) => {
  try {
    const app = await db.providerApplication.findUnique({ where: { id: req.params.id } });
    const fileId = app?.photoUrl?.startsWith("tg:") ? app.photoUrl.slice(3) : null;
    if (!fileId || !process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(404).json({ error: "no ID photo on file" });
    }
    const info = (await (
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`
      )
    ).json()) as { ok: boolean; result?: { file_path?: string } };
    if (!info.ok || !info.result?.file_path) return res.status(404).json({ error: "telegram file gone" });
    const file = await fetch(
      `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${info.result.file_path}`
    );
    if (!file.ok || !file.body) return res.status(502).json({ error: "download failed" });
    res.setHeader("content-type", file.headers.get("content-type") ?? "image/jpeg");
    const reader = file.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
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
          telegramChatId: app.telegramChatId,
          email: app.email,
          ninLast4: app.nin ? app.nin.slice(-4) : undefined,
          ninVerified: false,
          latitude: app.latitude,
          longitude: app.longitude,
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
