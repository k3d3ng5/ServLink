import { Router } from "express";
import { db } from "../db.js";
import {
  FollowUpResponseSchema,
  FollowUpSchema,
  RateSchema,
  ReworkSchema,
} from "../schemas.js";
import { applyTransition } from "../transitions.js";

export const jobs = Router();

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
