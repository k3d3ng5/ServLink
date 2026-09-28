import { Router } from "express";
import { db } from "../db.js";

// GET /metrics — answers the 70/70/70 validation questions live (Phase 8).
export const metrics = Router();

metrics.get("/", async (_req, res, next) => {
  try {
    const requests = await db.serviceRequest.findMany({
      include: { jobs: true },
    });
    const events = await db.statusEvent.findMany();
    const followUps = await db.followUp.findMany();

    const total = requests.length;
    const matched = requests.filter((r) => r.jobs.length > 0);
    const matchedFast = matched.filter((r) => {
      const job = r.jobs[0];
      return job.matchedAt.getTime() - r.createdAt.getTime() <= 2 * 3600_000;
    });
    const completed = requests.filter((r) =>
      ["COMPLETED"].includes(r.status)
    );
    const confirmedOk = followUps.filter((f) => f.confirmedOk === true).length;

    res.json({
      requests: total,
      matchRate: total ? matched.length / total : 0,
      matchUnder2hRate: matched.length ? matchedFast.length / matched.length : 0,
      completionRate: matched.length ? completed.length / matched.length : 0,
      confirmedOk,
      events: events.length,
      byChannel: {
        app: requests.filter((r) => r.sourceChannel === "app").length,
        telegram: requests.filter((r) => r.sourceChannel === "telegram").length,
      },
    });
  } catch (err) {
    next(err);
  }
});
