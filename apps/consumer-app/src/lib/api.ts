// API client — same core as bot + console. Pilot: dev machine on LAN.
// Expo Go phones can't reach localhost: set your machine's LAN IP here.
export const API_URL = "http://192.168.1.10:3001";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
  return body as T;
}

export interface JobView {
  id: string;
  provider: { name: string };
  followUps: Array<{ id: string }>;
}
export interface RequestView {
  id: string;
  description: string;
  zoneId: string;
  categoryId: string | null;
  status: string;
  address: string;
  jobs: JobView[];
  events: Array<{ fromStatus: string; toStatus: string; actor: string; note: string | null }>;
}

export const api = {
  createRequest: (b: Record<string, unknown>) =>
    req<{ request: { id: string } }>("/requests", { method: "POST", body: JSON.stringify(b) }),
  myRequests: (email: string) =>
    req<{ requests: RequestView[] }>(`/requests?channel=app&handle=${encodeURIComponent(email)}`),
  request: (id: string) => req<{ request: RequestView }>(`/requests/${id}`),
  respondFollowUp: (followUpId: string, confirmedOk: boolean) =>
    req(`/jobs/followups/${followUpId}/respond`, {
      method: "POST",
      body: JSON.stringify({ confirmedOk }),
    }),
  rate: (jobId: string, score: number) =>
    req(`/jobs/${jobId}/rate`, { method: "POST", body: JSON.stringify({ score }) }),
};
