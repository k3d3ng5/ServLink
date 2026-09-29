export const API_URL =
  process.env.CORE_API_URL ??
  process.env.NEXT_PUBLIC_CORE_API_URL ??
  "http://localhost:3001";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export interface QueueItem {
  id: string;
  description: string;
  zoneId: string;
  categoryId: string | null;
  status: string;
  sourceChannel: string;
  createdAt: string;
  customer: { name: string | null; handle: string };
  jobs: Array<{ id: string; provider: { name: string } }>;
}

export interface Suggestion {
  providerId: string;
  name: string;
  tier: string;
  score: number;
  distanceKm: number | null;
  reasons: string[];
}

export interface AppItem {
  id: string;
  name: string;
  phone: string;
  categories: string;
  zones: string;
  skillNote: string | null;
  status: string;
  createdAt: string;
}

export interface Analytics {
  perDay: Record<string, number>;
  avgMatchSecs: number;
  funnel: Record<string, number>;
  leaderboard: Array<{ name: string; jobs: number; completed: number; avgRating: number | null }>;
}

export const api = {
  queue: () => req<{ requests: QueueItem[] }>("/requests?status=REQUESTED"),
  allRequests: () => req<{ requests: QueueItem[] }>("/requests"),
  request: (id: string) =>
    req<{ request: QueueItem & { address: string; events: Array<{ fromStatus: string; toStatus: string; actor: string; at: string; note: string | null }> } }>(
      `/requests/${id}`
    ),
  suggestions: (id: string) => req<{ suggestions: Suggestion[] }>(`/requests/${id}/suggestions`),
  match: (requestId: string, providerId: string) =>
    req(`/requests/${requestId}/match`, {
      method: "POST",
      body: JSON.stringify({ providerId, matchedBy: "console" }),
    }),
  transition: (jobId: string, to: string) =>
    req(`/requests/jobs/${jobId}/transition`, {
      method: "POST",
      body: JSON.stringify({ to, actor: "console" }),
    }),
  applications: () => req<{ applications: AppItem[] }>("/providers/provider-applications"),
  review: (id: string, decision: "approve" | "reject") =>
    req(`/providers/provider-applications/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ decision, reviewedBy: "console" }),
    }),
  metrics: () =>
    req<{
      requests: number;
      matchRate: number;
      matchUnder2hRate: number;
      completionRate: number;
      confirmedOk: number;
      byChannel: { app: number; telegram: number };
    }>("/metrics"),
  analytics: () => req<Analytics>("/metrics/analytics"),
};
