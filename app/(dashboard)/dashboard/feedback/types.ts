import { z } from "zod";
import {
  feedbackCategorySchema,
  feedbackStatusSchema,
  type FeedbackCategory,
  type FeedbackSort,
  type FeedbackStatus,
} from "@/lib/types";

export const TITLE_MAX = 120;
export const BODY_MAX = 2000;
export const COMMENT_MAX = 1000;
export const NOTE_MAX = 500;
export const PAGE_SIZE = 20;

export const createFeedbackPayloadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give it a title")
    .max(TITLE_MAX, `Keep the title under ${TITLE_MAX} characters`),
  category: feedbackCategorySchema,
  body: z
    .string()
    .trim()
    .min(10, "Say a little more — what's the problem or the idea?")
    .max(BODY_MAX, `Keep it under ${BODY_MAX} characters`),
});
export type CreateFeedbackPayload = z.infer<typeof createFeedbackPayloadSchema>;

export const commentPayloadSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write something first")
    .max(COMMENT_MAX, `Keep it under ${COMMENT_MAX} characters`),
});
export type CommentPayload = z.infer<typeof commentPayloadSchema>;

export const setStatusPayloadSchema = z.object({
  status: feedbackStatusSchema,
  note: z
    .string()
    .trim()
    .max(NOTE_MAX, `Keep the note under ${NOTE_MAX} characters`)
    .optional(),
});
export type SetStatusPayload = z.infer<typeof setStatusPayloadSchema>;

/** List filters — also the react-query key, so keep it plain data. */
export type FeedbackFilters = {
  page: number;
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  sort: FeedbackSort;
};

export const DEFAULT_FILTERS: FeedbackFilters = { page: 1, sort: "top" };

export const STATUS_META: Record<
  FeedbackStatus,
  { label: string; className: string }
> = {
  OPEN: {
    label: "Open",
    className: "text-muted-foreground bg-muted border-border",
  },
  PLANNED: {
    label: "Planned",
    className: "text-social bg-social/10 border-social/20",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "text-gold bg-gold/10 border-gold/20",
  },
  DONE: { label: "Done", className: "text-win bg-win/10 border-win/20" },
  DECLINED: {
    label: "Declined",
    className: "text-loss bg-loss/10 border-loss/20",
  },
};

/** Tabs on the board. Declined stays reachable via the API but isn't a tab. */
export const STATUS_TABS: { value: FeedbackStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

export const CATEGORY_META: Record<FeedbackCategory, { label: string }> = {
  FEATURE: { label: "Feature" },
  BUG: { label: "Bug" },
  IMPROVEMENT: { label: "Improvement" },
};

export const CATEGORY_OPTIONS = (
  Object.keys(CATEGORY_META) as FeedbackCategory[]
).map((value) => ({ value, name: CATEGORY_META[value].label }));

export const STATUS_OPTIONS = (
  Object.keys(STATUS_META) as FeedbackStatus[]
).map((value) => ({ value, name: STATUS_META[value].label }));
