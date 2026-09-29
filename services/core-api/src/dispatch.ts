import { db } from "./db.js";
import { suggestProviders } from "./matching.js";
import { notifyAdmins, send } from "./notify.js";
import { applyTransition } from "./transitions.js";

const WINDOW_MIN = Number(process.env.OFFER_WINDOW_MIN ?? 5);
const MAX_OFFERS = Number(process.env.MAX_AUTO_OFFERS ?? 3);
const TICK_MS = Number(process.env.DISPATCH_TICK_MS ?? 60_000);

// Shared match creator: manual (/match, console) and automatic (dispatch) use it.
export async function createMatch(requestId: string, providerId: string, matchedBy: string) {
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
    include: { customer: true },
  });
  if (!request) throw Object.assign(new Error("request not found"), { status: 404 });
  const provider = await db.provider.findUnique({ where: { id: providerId } });
  if (!provider) throw Object.assign(new Error("provider not found"), { status: 404 });

  if (request.status === "MATCHED") {
    const prev = await db.job.findFirst({
      where: { requestId },
      orderBy: { matchedAt: "desc" },
    });
    if (prev) await applyTransition(prev.id, "CANCELLED", matchedBy, "rematch");
  } else if (request.status !== "REQUESTED") {
    throw Object.assign(new Error(`request is ${request.status}`), { status: 422 });
  }

  const job = await db.job.create({ data: { requestId, providerId, matchedBy } });
  await db.serviceRequest.update({ where: { id: requestId }, data: { status: "MATCHED" } });
  const from = request.status;
  await db.statusEvent.create({
    data: { requestId, fromStatus: from, toStatus: "MATCHED", actor: matchedBy, note: `provider ${provider.name}` },
  });

  const customerTo =
    (request.sourceChannel === "telegram" ? request.customer.handle : request.customer.email ?? request.customer.handle) ?? "";
  if (customerTo) {
    await send({
      to: customerTo,
      kind: request.sourceChannel === "telegram" ? "telegram" : "push",
      text: `ServLink: ${provider.name} is assigned to your request (${request.description.slice(0, 80)}). Ref ${job.id.slice(0, 8)}.\nPlease confirm:`,
      meta: { jobId: job.id, jobButtons: `${job.id}:customer` },
    });
  }
  return { job, request, provider };
}

async function offerToProvider(jobId: string, requestId: string, providerId: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { request: true, provider: true },
  });
  if (!job) return;
  const expiresAt = new Date(Date.now() + WINDOW_MIN * 60_000);
  await db.jobOffer.create({ data: { jobId, providerId, status: "pending", expiresAt } });

  if (job.provider.telegramChatId) {
    await send({
      to: job.provider.telegramChatId,
      kind: "telegram",
      text: `🧰 New ServLink job (${WINDOW_MIN}-min window): ${job.request.description.slice(0, 100)} (${job.request.zoneId}, ${job.request.address}). Ref ${job.id.slice(0, 8)}.\nAccept?`,
      meta: { jobId: job.id, jobButtons: `${job.id}:provider` },
    });
  }
}

// Automatic dispatch: offer to the top unoffered suggestion. Returns null when
// nobody is left (founder alerted) or the request already resolved.
export async function dispatchNext(requestId: string) {
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
    include: { jobs: { include: { offers: true } } },
  });
  if (!request || ["COMPLETED", "CANCELLED"].includes(request.status)) return null;

  const offeredIds = new Set(request.jobs.flatMap((j) => j.offers.map((o) => o.providerId)));
  const attempts = request.jobs.length;
  if (attempts >= MAX_OFFERS) {
    await notifyAdmins(`⚠️ \`${requestId.slice(0, 8)}\` exhausted ${MAX_OFFERS} auto-offers — human needed.`);
    return null;
  }
  const suggestions = (await suggestProviders(requestId, 10)).filter((s) => !offeredIds.has(s.providerId));
  if (!suggestions.length) {
    await notifyAdmins(`⚠️ No (more) online providers for \`${requestId.slice(0, 8)}\` — human needed.`);
    return null;
  }

  const top = suggestions[0];
  const { job } = await createMatch(requestId, top.providerId, "system");
  await offerToProvider(job.id, requestId, top.providerId);
  return job;
}

export async function runDispatchSweep(now = new Date()) {
  const expired = await db.jobOffer.findMany({
    where: { status: "pending", expiresAt: { lte: now } },
    include: { job: true },
    take: 20,
  });
  for (const offer of expired) {
    await db.jobOffer.update({ where: { id: offer.id }, data: { status: "expired" } });
    await applyTransition(offer.jobId, "CANCELLED", "system", "offer expired").catch(() => {});
    await db.serviceRequest.update({
      where: { id: offer.job.requestId },
      data: { status: "REQUESTED" },
    }).catch(() => {});
    await dispatchNext(offer.job.requestId).catch((e) => console.error("[dispatch]", e));
  }
  return expired.length;
}

export function startDispatchWorker() {
  const timer = setInterval(() => {
    runDispatchSweep().catch((err) => console.error("[dispatch]", err));
  }, TICK_MS);
  timer.unref?.();
  return timer;
}
