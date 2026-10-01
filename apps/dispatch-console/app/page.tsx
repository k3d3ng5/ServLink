import Link from "next/link";
import { api } from "@/lib/api";

export default async function QueuePage() {
  const { requests } = await api.queue();
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Inbound queue ({requests.length})</h1>
      {requests.length === 0 && (
        <p className="text-neutral-500">Queue clear — nothing awaiting match.</p>
      )}
      <ul className="space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="rounded border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{r.description}</p>
                <p className="text-sm text-neutral-500">
                  {r.zoneId} · {r.categoryId ?? "uncategorized"} · via {r.sourceChannel} ·{" "}
                  {r.customer.name ?? r.customer.handle}
                </p>
              </div>
              <Link
                href={`/requests/${r.id}`}
                className="rounded bg-[#0556ed] px-3 py-1.5 text-sm font-medium text-white"
              >
                Open
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
