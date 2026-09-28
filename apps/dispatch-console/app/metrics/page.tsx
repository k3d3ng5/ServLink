import { api } from "@/lib/api";

function pct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export default async function MetricsPage() {
  const m = await api.metrics();
  const cards: Array<[string, string]> = [
    ["Requests", String(m.requests)],
    ["Match rate", pct(m.matchRate)],
    ["Matched < 2h", pct(m.matchUnder2hRate)],
    ["Completion rate", pct(m.completionRate)],
    ["Confirmed OK", String(m.confirmedOk)],
    ["Via App / Telegram", `${m.byChannel.app} / ${m.byChannel.telegram}`],
  ];
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Validation — 70 / 70 / 70</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded border bg-white p-4">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
