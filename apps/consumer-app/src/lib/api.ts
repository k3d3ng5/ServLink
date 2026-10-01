// API client — same core as bot + console.
// Resolution order: explicit build-time URL (standalone builds) → Metro host
// (Expo Go dev) → localhost. No more hardcoded IPs.
import Constants from "expo-constants";
import { session } from "../session";

function resolveBaseUrl(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string };
  if (extra.apiUrl) return extra.apiUrl;
  const hostUri = Constants.expoConfig?.hostUri ?? "";
  const host = hostUri.split(":")[0];
  if (host) return `http://${host}:3001`;
  return "http://localhost:3001";
}

export const API_URL = resolveBaseUrl();

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      // Server-to-server: identify origin so Better Auth's CSRF check passes.
      origin: API_URL,
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `API ${res.status}`);
  return body as T;
}

export interface JobView {
  id: string;
  provider: { name: string };
  followUps: Array<{ id: string }>;
  amountKobo: number | null;
  paymentStatus: string;
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
  chat: (b: { sessionId?: string; email?: string; channel?: string; message: string; latitude?: number; longitude?: number }) =>
    req<{ sessionId: string; reply: string; quickReplies: string[]; requestId: string | null; done: boolean }>(
      "/assistant/chat",
      { method: "POST", body: JSON.stringify(b) }
    ),
  proMe: () =>
    req<{
      provider: {
        id: string;
        isOnline: boolean;
        jobs: Array<{ id: string; request: { description: string; status: string } }>;
      };
    }>(`/providers/me?email=${encodeURIComponent(session.email)}`),
  setOnline: (id: string, online: boolean) =>
    req(`/providers/${id}/online`, { method: "POST", body: JSON.stringify({ online }) }),
  sendOtp: (email: string) =>
    req("/api/auth/email-otp/send-verification-otp", {
      method: "POST",
      body: JSON.stringify({ email, type: "sign-in" }),
    }),
  verifyOtp: (email: string, otp: string) =>
    req<{ token: string }>("/api/auth/sign-in/email-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),
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
  payInit: (jobId: string) =>
    req<{ authorization_url: string; reference: string }>(`/jobs/${jobId}/pay-init`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};
