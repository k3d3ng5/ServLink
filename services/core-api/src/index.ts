import "dotenv/config";
import cors from "cors";
import express from "express";import { auth } from "./auth.js";
import { startDispatchWorker } from "./dispatch.js";
import { startFollowUpWorker } from "./followup.js";
import { assistantRoutes } from "./routes/assistant.js";
import { authRoutes } from "./routes/auth.js";
import { webhooks } from "./routes/webhooks.js";
import { jobs } from "./routes/jobs.js";
import { metrics } from "./routes/metrics.js";
import { providers } from "./routes/providers.js";
import { requests } from "./routes/requests.js";

const app = express();
app.use(cors());
// Keep the raw body for Paystack webhook HMAC verification.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody?: string }).rawBody = buf.toString("utf8");
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "core-api", phase: 3 });
});

app.use("/requests", requests);
app.use("/jobs", jobs);
app.use("/providers", providers);
app.use("/metrics", metrics);
app.use("/auth", authRoutes);
app.use("/assistant", assistantRoutes);
app.use("/webhooks", webhooks);

// Better Auth handler (email-OTP endpoints: /api/auth/email-otp/...)
// Note: req.originalUrl keeps the /api/auth prefix the handler routes on.
app.use("/api/auth", async (req, res) => {
  const request = new Request(
    `${process.env.PUBLIC_API_URL ?? "http://localhost:3001"}${req.originalUrl}`,
    {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
    }
  );
  const response = await auth.handler(request);
  res.status(response.status);
  response.headers.forEach((v, k) => res.setHeader(k, v));
  res.send(Buffer.from(await response.arrayBuffer()));
});

// Zod + domain errors -> clean JSON.
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const e = err as { status?: number; issues?: unknown; message?: string };
    if (e.issues) return res.status(400).json({ error: "validation", issues: e.issues });
    const status = e.status ?? 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: e.message ?? "internal error" });
  }
);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`core-api listening on :${port}`));
startFollowUpWorker();
startDispatchWorker();
