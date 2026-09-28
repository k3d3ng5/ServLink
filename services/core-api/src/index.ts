import "dotenv/config";
import express from "express";
import { startFollowUpWorker } from "./followup.js";
import { jobs } from "./routes/jobs.js";
import { metrics } from "./routes/metrics.js";
import { providers } from "./routes/providers.js";
import { requests } from "./routes/requests.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "core-api", phase: 3 });
});

app.use("/requests", requests);
app.use("/jobs", jobs);
app.use("/providers", providers);
app.use("/metrics", metrics);

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
