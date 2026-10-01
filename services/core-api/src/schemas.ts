import { z } from "zod";

export const IntakeSchema = z.object({
  description: z.string().min(3).max(2000),
  categoryId: z.string().optional(),
  zoneId: z.string().optional(), // server auto-assigns from GPS; no area picker on clients
  address: z.string().min(3).max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  preferredTime: z.string().max(200).optional(),
  channel: z.enum(["app", "telegram"]),
  handle: z.string().min(1).max(200),
  email: z.string().email().optional(),
  name: z.string().max(200).optional(),
});
export type Intake = z.infer<typeof IntakeSchema>;

export const MatchSchema = z.object({
  providerId: z.string().min(1),
  matchedBy: z.string().min(1).max(100).default("concierge"),
});
export type Match = z.infer<typeof MatchSchema>;

export const TransitionSchema = z.object({
  to: z.enum([
    "CONFIRMED",
    "IN_PROGRESS",
    "DONE_PENDING_CONFIRM",
    "COMPLETED",
    "CANCELLED",
    "REWORK_REQUESTED",
    "REMATCHED",
  ]),
  actor: z.string().min(1).max(100).default("concierge"),
  note: z.string().max(1000).optional(),
});
export type Transition = z.infer<typeof TransitionSchema>;

export const FollowUpSchema = z.object({
  channel: z.enum(["app", "telegram", "email"]),
});
export type FollowUpInput = z.infer<typeof FollowUpSchema>;

export const FollowUpResponseSchema = z.object({
  confirmedOk: z.boolean(),
  response: z.string().max(1000).optional(),
});
export type FollowUpResponse = z.infer<typeof FollowUpResponseSchema>;

export const QuoteSchema = z.object({
  amountKobo: z.number().int().min(100),
  laborKobo: z.number().int().min(0).optional(),
  materialsKobo: z.number().int().min(0).optional(),
  materialsNote: z.string().max(500).optional(),
  actor: z.string().max(100).default("concierge"),
});
export type Quote = z.infer<typeof QuoteSchema>;

export const RateSchema = z.object({
  score: z.number().int().min(1).max(5),
  note: z.string().max(1000).optional(),
});
export type Rate = z.infer<typeof RateSchema>;

export const ReworkSchema = z.object({
  reason: z.string().min(3).max(1000),
});
export type Rework = z.infer<typeof ReworkSchema>;

export const ApplicationSchema = z.object({
  name: z.string().min(2).max(200),
  phone: z.string().min(5).max(30),
  categories: z.array(z.string()).min(1),
  zones: z.array(z.string()).min(1),
  telegramChatId: z.string().optional(),
  email: z.string().email().optional(),
  nin: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits").optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  skillNote: z.string().max(1000).optional(),
  photoUrl: z.string().url().max(1000).optional(),
});
export type Application = z.infer<typeof ApplicationSchema>;

export const ReviewSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reviewedBy: z.string().min(1).max(100).default("concierge"),
});
export type Review = z.infer<typeof ReviewSchema>;
