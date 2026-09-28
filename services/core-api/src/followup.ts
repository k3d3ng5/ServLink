import { db } from "./db.js";
import { send } from "./notify.js";

// Follow-up worker: jobs DONE_PENDING_CONFIRM older than FOLLOWUP_DELAY_MIN
// get a follow-up prompt ("Was it done well?") on the customer's origin channel.
const DELAY_MIN = Number(process.env.FOLLOWUP_DELAY_MIN ?? 60);
const TICK_MS = Number(process.env.FOLLOWUP_TICK_MS ?? 60_000);

export async function runFollowUpSweep(now = new Date()) {
  const cutoff = new Date(now.getTime() - DELAY_MIN * 60_000);
  const due = await db.job.findMany({
    where: {
      doneAt: { lte: cutoff },
      request: { status: "DONE_PENDING_CONFIRM" },
      followUps: { none: {} },
    },
    include: { request: { include: { customer: true } } },
    take: 50,
  });
  for (const job of due) {
    const channel = job.request.sourceChannel as "app" | "telegram";
    const customer = job.request.customer;
    const to =
      (channel === "telegram" ? customer.handle : customer.email ?? customer.handle) ?? "";
    await db.$transaction([
      db.followUp.create({
        data: { jobId: job.id, channel, response: null },
      }),
      db.serviceRequest.update({
        where: { id: job.requestId },
        data: { status: "FOLLOW_UP_SENT" },
      }),
      db.statusEvent.create({
        data: {
          requestId: job.requestId,
          fromStatus: "DONE_PENDING_CONFIRM",
          toStatus: "FOLLOW_UP_SENT",
          actor: "system",
        },
      }),
    ]);
    if (!to) {
      console.log(`[followup] no reachable contact for job ${job.id}, recorded only`);
      continue;
    }
    await send({
      to,
      kind: channel === "telegram" ? "telegram" : "push",
      text: `ServLink: was your ${job.request.description.slice(0, 80)} done well? Reply YES, or NO to request a rework.`,
      meta: { jobId: job.id },
    });
  }
  return due.length;
}

export function startFollowUpWorker() {
  const timer = setInterval(() => {
    runFollowUpSweep().catch((err) => console.error("[followup]", err));
  }, TICK_MS);
  timer.unref?.();
  return timer;
}
