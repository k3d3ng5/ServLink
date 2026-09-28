import { canTransition, type JobStatus } from "@servlink/core-domain";
import { db } from "./db.js";

const STAMP: Record<string, "confirmedAt" | "startedAt" | "doneAt"> = {
  CONFIRMED: "confirmedAt",
  IN_PROGRESS: "startedAt",
  DONE_PENDING_CONFIRM: "doneAt",
};

export async function applyTransition(
  jobId: string,
  to: JobStatus,
  actor: string,
  note?: string
) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { request: true },
  });
  if (!job) throw Object.assign(new Error("job not found"), { status: 404 });

  const from = job.request.status as JobStatus;
  if (!canTransition(from, to)) {
    throw Object.assign(new Error(`illegal transition ${from} -> ${to}`), {
      status: 422,
    });
  }

  const stamp = STAMP[to];
  const [updated] = await db.$transaction([
    db.job.update({
      where: { id: jobId },
      data: stamp ? { [stamp]: new Date() } : {},
    }),
    db.serviceRequest.update({
      where: { id: job.requestId },
      data: { status: to },
    }),
    db.statusEvent.create({
      data: { requestId: job.requestId, fromStatus: from, toStatus: to, actor, note },
    }),
  ]);
  return { job: updated, from, to };
}
