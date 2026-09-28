// Shared domain: import from here, never redefine in apps/services.

export const JOB_STATUSES = [
  "REQUESTED",
  "MATCHED",
  "CONFIRMED",
  "IN_PROGRESS",
  "DONE_PENDING_CONFIRM",
  "COMPLETED",
  "CANCELLED",
  "FOLLOW_UP_SENT",
  "REWORK_REQUESTED",
  "REMATCHED",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** Every adapter must produce this — nothing else enters the core. */
export interface NormalizedRequest {
  what: string;
  category?: string;
  zone: string;
  address: string;
  preferredTime?: string;
  contact: { channel: string; handle: string; email?: string };
  note?: string;
}

const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  REQUESTED: ["MATCHED", "CANCELLED"],
  MATCHED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["DONE_PENDING_CONFIRM", "CANCELLED"],
  DONE_PENDING_CONFIRM: ["COMPLETED", "REWORK_REQUESTED", "FOLLOW_UP_SENT"],
  FOLLOW_UP_SENT: ["COMPLETED", "REWORK_REQUESTED"],
  REWORK_REQUESTED: ["REMATCHED", "CANCELLED"],
  REMATCHED: ["CONFIRMED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
