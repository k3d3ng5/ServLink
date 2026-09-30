import { Router } from "express";
import { z } from "zod";
import Groq from "groq-sdk";
import { chat } from "../assistant.js";

export const assistantRoutes = Router();

// GET /assistant/models — models this key may call (dev/admin).
assistantRoutes.get("/models", async (_req, res, next) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: "no key" });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const list = await groq.models.list();
    res.json({ models: list.data.map((m) => m.id) });
  } catch (err) {
    next(err);
  }
});

// POST /assistant/chat — Groq chatbot driving the standard request workflow.
assistantRoutes.post("/chat", async (req, res, next) => {
  try {
    const body = z
      .object({
        sessionId: z.string().optional(),
        email: z.string().email().optional(),
        channel: z.string().max(20).optional(),
        message: z.string().min(1).max(2000),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
      })
      .parse(req.body);
    const result = await chat(body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
