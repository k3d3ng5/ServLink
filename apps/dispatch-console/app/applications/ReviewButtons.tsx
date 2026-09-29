"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const BASE = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3001";

export function ReviewButtons({ id }: { id: string }) {
  const [msg, setMsg] = useState("");
  const router = useRouter();
  async function review(decision: "approve" | "reject") {
    setMsg("");
    const res = await fetch(`${BASE}/providers/provider-applications/${id}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, reviewedBy: "console" }),
    });
    if (res.ok) {
      setMsg(`${decision}d ✓`);
      router.refresh();
    } else setMsg(`Failed: ${res.status}`);
  }
  return (
    <div className="mt-3 flex items-center gap-2">
      <button onClick={() => review("approve")} className="rounded bg-emerald-700 px-3 py-1 text-sm text-white">
        Approve
      </button>
      <button onClick={() => review("reject")} className="rounded border px-3 py-1 text-sm">
        Reject
      </button>
      {msg && <span className="text-sm">{msg}</span>}
    </div>
  );
}
