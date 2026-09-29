import { api } from "@/lib/api";

export default async function AnalyticsPage() {
  const a = await api.analytics();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Analytics & insights</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-neutral-500">Avg time to match</p>
          <p className="text-2xl font-bold">
            {a.avgMatchSecs < 90 ? `${a.avgMatchSecs}s` : `${Math.round(a.avgMatchSecs / 60)}m`}
          </p>
        </div>
        {Object.entries(a.funnel).map(([status, n]) => (
          <div key={status} className="rounded border bg-white p-4">
            <p className="text-sm text-neutral-500">{status}</p>
            <p className="text-2xl font-bold">{n}</p>
          </div>
        ))}
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 font-bold">Provider leaderboard</h2>
        {a.leaderboard.length === 0 && <p className="text-sm text-neutral-500">No jobs yet.</p>}
        <ul className="space-y-1 text-sm">
          {a.leaderboard.map((p) => (
            <li key={p.name}>
              <b>{p.name}</b> — {p.jobs} jobs, {p.completed} completed
              {p.avgRating !== null ? `, ★${p.avgRating}` : ""}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 font-bold">Requests per day</h2>
        <ul className="space-y-1 text-sm">
          {Object.entries(a.perDay).map(([day, n]) => (
            <li key={day}>
              {day}: <b>{n}</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
