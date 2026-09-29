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

// GET /metrics/analytics — founder insight page: funnel, match speed, leaderboard.
metrics.get("/analytics", async (_req, res, next) => {
  try {
    const requests = await db.serviceRequest.findMany({ include: { jobs: true } });
    const jobs = await db.job.findMany({ include: { provider: true, ratings: true } });

    const perDay: Record<string, number> = {};
    for (const r of requests) {
      const day = r.createdAt.toISOString().slice(0, 10);
      perDay[day] = (perDay[day] ?? 0) + 1;
    }

    const matchSecs = jobs.map((j) => {
      const req = requests.find((r) => r.id === j.requestId);
      return req ? (j.matchedAt.getTime() - req.createdAt.getTime()) / 1000 : 0;
    });
    const avgMatchSecs = matchSecs.length
      ? Math.round(matchSecs.reduce((a, b) => a + b, 0) / matchSecs.length)
      : 0;

    const funnel: Record<string, number> = {};
    for (const r of requests) funnel[r.status] = (funnel[r.status] ?? 0) + 1;

    const byProvider: Record<string, { name: string; jobs: number; completed: number; ratingSum: number; ratingCount: number }> = {};
    for (const j of jobs) {
      const p = (byProvider[j.providerId] ??= { name: j.provider.name, jobs: 0, completed: 0, ratingSum: 0, ratingCount: 0 });
      p.jobs++;
      const req = requests.find((r) => r.id === j.requestId);
      if (req?.status === "COMPLETED") p.completed++;
      for (const r of j.ratings) {
        p.ratingSum += r.score;
        p.ratingCount++;
      }
    }
    const leaderboard = Object.values(byProvider)
      .map((p) => ({
        ...p,
        avgRating: p.ratingCount ? Math.round((p.ratingSum / p.ratingCount) * 10) / 10 : null,
      }))
      .sort((a, b) => b.jobs - a.jobs);

    res.json({ perDay, avgMatchSecs, funnel, leaderboard });
  } catch (err) {
    next(err);
  }
});
