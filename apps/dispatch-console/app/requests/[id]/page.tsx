import { api } from "@/lib/api";
import { MatchPanel } from "./MatchPanel";

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ request }, { suggestions }] = await Promise.all([
    api.request(id),
    api.suggestions(id),
  ]);
  const job = request.jobs.at(-1);

  return (
    <div className="space-y-6">
      <div className="rounded border bg-white p-4">
        <p className="text-sm text-neutral-500">
          {request.zoneId} · {request.categoryId ?? "uncategorized"} · {request.status}
        </p>
        <h1 className="text-xl font-bold">{request.description}</h1>
        <p className="mt-1 text-sm">
          {request.address} · {request.customer.name ?? request.customer.handle}
        </p>
        {job && (
          <p className="mt-2 text-sm">
            Active job: <code>{job.id.slice(0, 8)}</code> → {job.provider.name}
            {job.amountKobo
              ? ` · ₦${(job.amountKobo / 100).toLocaleString("en-NG")} (${job.paymentStatus})`
              : ""}
          </p>
        )}
      </div>

      <MatchPanel requestId={id} requestStatus={request.status} suggestions={suggestions} jobId={job?.id} />

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 font-bold">Audit trail</h2>
        <ul className="space-y-1 text-sm">
          {request.events.map((e, i) => (
            <li key={i} className="text-neutral-600">
              {e.fromStatus} → <b>{e.toStatus}</b> by {e.actor}
              {e.note ? ` — ${e.note}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
