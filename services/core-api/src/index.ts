import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "core-api", phase: 0 });
});

// Phase 3: POST /requests, POST /jobs, transitions guarded by canTransition(),
// Prisma + Postgres, Better Auth + Resend OTP, follow-up worker.

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`core-api listening on :${port}`));
