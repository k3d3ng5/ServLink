import type { JobStatus, NormalizedRequest } from "@servlink/core-domain";

/**
 * The two-function contract every channel implements.
 * Telegram now, WhatsApp/web/voice later — same two functions.
 */
export interface ChannelAdapter {
  /** Convert raw channel payload into the normalized request. */
  normalize(raw: unknown): NormalizedRequest;
  /** Deliver a job event (match confirm, follow-up…) back to the user. */
  deliver(event: { to: string; status: JobStatus; text: string }): Promise<void>;
}
