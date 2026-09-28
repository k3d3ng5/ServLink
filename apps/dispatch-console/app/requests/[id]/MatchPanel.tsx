"use client";

import { useState } from "react";
import type { Suggestion } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3001";

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export function MatchPanel({
  requestId,
  requestStatus,
  suggestions,
  jobId,
}: {
  requestId: string;
  requestStatus: string;
  suggestions: Suggestion[];
  jobId?: string;
}) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(true);
    setMsg("");
    try {
      await fn();
      setMsg(`${label} ✓ — refresh to see the new state.`);
    } catch (e) {
      setMsg(`${label} failed: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  const matchable = requestStatus === "REQUESTED" || requestStatus === "MATCHED";

  return (
    <div className="rounded border bg-white p-4">
      <h2 className="mb-2 font-bold">Match & lifecycle</h2>
      {matchable ? (
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s.providerId} className="flex items-center justify-between gap-3 text-sm">
              <span>
                <b>{s.name}</b> ({s.tier}, {s.score}) — {s.reasons.join(", ")}
              </span>
              <button
                disabled={busy}
                onClick={() => run("Matched", () => post(`/requests/${requestId}/match`, { providerId: s.providerId, matchedBy: "console" }))}
                className="rounded bg-emerald-700 px-3 py-1 text-white disabled:opacity-50"
              >
                Match
              </button>
            </li>
          ))}
          {suggestions.length === 0 && <p className="text-sm text-neutral-500">No eligible providers.</p>}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">Request is {requestStatus} — matching closed.</p>
      )}

      {jobId && (
        <div className="mt-4 flex flex-wrap gap-2">
          {["CONFIRMED", "IN_PROGRESS", "DONE_PENDING_CONFIRM", "CANCELLED"].map((to) => (
            <button
              key={to}
              disabled={busy}
              onClick={() => run(to, () => post(`/requests/jobs/${jobId}/transition`, { to, actor: "console" }))}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              → {to}
            </button>
          ))}
        </div>
      )}
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
