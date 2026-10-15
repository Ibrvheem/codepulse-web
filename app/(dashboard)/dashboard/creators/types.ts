import { z } from "zod";
import type {
  CreatorScoreDimension,
  CreatorSort,
  CreatorStatus,
} from "@/lib/types";

export const PAGE_SIZE = 20;
export const DRAFT_MAX = 2000;
export const NOTES_MAX = 2000;
export const CREATORS_PATH = "/dashboard/creators";

export const discoverPayloadSchema = z.object({
  provider: z.string().min(1, "Pick a source"),
  query: z
    .string()
    .trim()
    .min(2, "Type a hashtag or keyword")
    .max(100, "Keep it under 100 characters"),
});
export type DiscoverPayload = z.infer<typeof discoverPayloadSchema>;

export const addCreatorPayloadSchema = z.object({
  platform: z.string().trim().min(1, "Which platform?").max(30),
  username: z.string().trim().min(1, "Their handle").max(60),
  profile_url: z.url("A full link, starting with https://"),
  name: z.string().trim().max(100).optional(),
  followers: z
    .union([z.number().int().min(0, "Can't be negative"), z.literal("")])
    .optional(),
  bio: z.string().trim().max(1000, "Keep it under 1000 characters").optional(),
  posts: z.string().trim().max(6000, "Keep it under 6000 characters").optional(),
  email: z.union([z.email("Not an email address"), z.literal("")]).optional(),
});
export type AddCreatorPayload = z.infer<typeof addCreatorPayloadSchema>;

export const outreachPayloadSchema = z.object({
  outreach_draft: z
    .string()
    .trim()
    .max(DRAFT_MAX, `Keep it under ${DRAFT_MAX} characters`),
});
export type OutreachPayload = z.infer<typeof outreachPayloadSchema>;

export const notesPayloadSchema = z.object({
  notes: z
    .string()
    .trim()
    .max(NOTES_MAX, `Keep it under ${NOTES_MAX} characters`),
});
export type NotesPayload = z.infer<typeof notesPayloadSchema>;

/** List filters, also the react-query key, so keep it plain data. */
export type CreatorFilters = {
  page: number;
  status?: CreatorStatus;
  q?: string;
  sort: CreatorSort;
};

export const DEFAULT_FILTERS: CreatorFilters = { page: 1, sort: "score" };

/** The pipeline in order. Rejected sits outside it. */
export const STAGES: CreatorStatus[] = [
  "DISCOVERED",
  "SHORTLISTED",
  "CONTACTED",
  "REPLIED",
  "TRIAL_SENT",
  "ACTIVATED",
  "SHARED",
  "CONVERTED",
];

export const STATUS_META: Record<
  CreatorStatus,
  { label: string; className: string }
> = {
  DISCOVERED: {
    label: "Discovered",
    className: "text-muted-foreground bg-muted border-border",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "text-social bg-social/10 border-social/20",
  },
  CONTACTED: {
    label: "Contacted",
    className: "text-social bg-social/10 border-social/20",
  },
  REPLIED: {
    label: "Replied",
    className: "text-gold bg-gold/10 border-gold/20",
  },
  TRIAL_SENT: {
    label: "Trial sent",
    className: "text-gold bg-gold/10 border-gold/20",
  },
  ACTIVATED: {
    label: "Activated",
    className: "text-win bg-win/10 border-win/20",
  },
  SHARED: { label: "Shared", className: "text-win bg-win/10 border-win/20" },
  CONVERTED: {
    label: "Converted",
    className: "text-win bg-win/10 border-win/20",
  },
  REJECTED: {
    label: "Rejected",
    className: "text-loss bg-loss/10 border-loss/20",
  },
};

export const STATUS_OPTIONS = [...STAGES, "REJECTED" as const].map((value) => ({
  value,
  name: STATUS_META[value].label,
}));

/** The stage after this one, or null at the end of the pipeline. */
export function nextStage(status: CreatorStatus): CreatorStatus | null {
  const index = STAGES.indexOf(status);
  return index === -1 ? null : (STAGES[index + 1] ?? null);
}

export const PLATFORM_LABEL: Record<string, string> = {
  devto: "DEV",
  github: "GitHub",
  x: "X",
};
export const platformLabel = (platform: string) =>
  PLATFORM_LABEL[platform] ?? platform;

/** Sub-scores in the order they're shown, with their weight in the total. */
export const SCORE_DIMENSIONS: {
  key: CreatorScoreDimension;
  label: string;
  weight: number;
}[] = [
  { key: "writelogs_fit", label: "WriteLogs fit", weight: 25 },
  { key: "documents_publicly", label: "Documents publicly", weight: 20 },
  { key: "developer_relevance", label: "Developer relevance", weight: 15 },
  { key: "actively_building", label: "Actively building", weight: 15 },
  { key: "audience_relevance", label: "Audience relevance", weight: 10 },
  { key: "recent_activity", label: "Recent activity", weight: 10 },
  { key: "engagement", label: "Engagement", weight: 5 },
];

export const QUERY_SUGGESTIONS = [
  "#100DaysOfCode",
  "#30DaysOfCode",
  "#BuildInPublic",
  "indie hacker",
  "building a SaaS",
];
