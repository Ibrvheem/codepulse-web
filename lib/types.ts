import { z } from "zod";
import { metaSchema } from "./schemas";

export const userSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string(),
  phone_no: z.string().nullish(),
  profile_picture: z.string().nullish(),
  // Nullish: sessions stored before the API started sending it lack it.
  created_at: z.string().nullish(),
});
export type User = z.infer<typeof userSchema>;

export const authTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});
export type AuthTokens = z.infer<typeof authTokensSchema>;

export const signinResponseSchema = authTokensSchema.extend({
  user: userSchema,
});
export type SigninResponse = z.infer<typeof signinResponseSchema>;

export const summaryVoiceSchema = z.enum(["you", "i"]);
export type SummaryVoice = z.infer<typeof summaryVoiceSchema>;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  repo_url: z.string().nullish(),
  timezone: z.string(),
  /** Local "HH:mm" at which the project's day closes; "00:00" = midnight. */
  summary_time: z.string().nullish(),
  summary_voice: summaryVoiceSchema.nullish(),
  created_at: z.string(),
  updated_at: z.string(),
  _count: z
    .object({
      pat_keys: z.number(),
      log_entries: z.number(),
      summaries: z.number(),
    })
    .optional(),
});
export type Project = z.infer<typeof projectSchema>;

export const logEntrySchema = z.object({
  id: z.string(),
  file_path: z.string(),
  language: z.string().nullish(),
  branch: z.string().nullish(),
  commit_hash: z.string().nullish(),
  commit_message: z.string().nullish(),
  source: z.string().nullish(),
  /** Commit hash that sealed this entry, "reconciled", or null = pending. */
  committed_in: z.string().nullish(),
  /** true = the edit was reverted / cancelled out (no net change). */
  matches_head: z.boolean().nullish(),
  /** Root folder name of the repo this came from; null on older clients. */
  repo_name: z.string().nullish(),
  /** Commit entries: every file the commit touched. */
  files: z.array(z.string()).nullish(),
  lines_added: z.number(),
  lines_removed: z.number(),
  started_at: z.string(),
  ended_at: z.string(),
  active_ms: z.number(),
  idle_ms: z.number(),
  was_interrupted: z.boolean(),
  created_at: z.string(),
});
export type LogEntry = z.infer<typeof logEntrySchema>;

export const patKeySchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  display_hint: z.string(),
  last_used_at: z.string().nullish(),
  expires_at: z.string().nullish(),
  revoked_at: z.string().nullish(),
  created_at: z.string(),
});
export type PatKey = z.infer<typeof patKeySchema>;

export const createdPatKeySchema = patKeySchema.extend({
  token: z.string(),
});
export type CreatedPatKey = z.infer<typeof createdPatKeySchema>;

export const summaryTaskSchema = z.object({
  id: z.string(),
  task: z.string(),
  /** Standup line, no pronoun. Empty on summaries generated before Aug 25 2026. */
  task_first_person: z.string().nullish(),
  description: z.string(),
  /** Part of the product this bullet belongs to. Empty on older summaries. */
  area: z.string().nullish(),
  files: z.array(z.string()),
  time_minutes: z.number(),
  tags: z.array(z.string()),
  confidence: z.number(),
});
export type SummaryTask = z.infer<typeof summaryTaskSchema>;

export const summarySchema = z.object({
  id: z.string(),
  date: z.string(),
  timezone: z.string(),
  title: z.string(),
  message: z.string(),
  /** "I" voice recap. Empty on summaries generated before Aug 25 2026. */
  message_first_person: z.string().nullish(),
  status: z.string(),
  logs_count: z.number(),
  tasks: z.array(summaryTaskSchema),
  /** Only on the single-summary read, not the list. */
  project: z.object({ name: z.string() }).nullish(),
  created_at: z.string(),
});
export type Summary = z.infer<typeof summarySchema>;

export const generateSummaryResponseSchema = z.object({
  generated: z.number(),
  summary_ids: z.array(z.string()),
  updates_used: z.number(),
  updates_limit: z.number(),
});
export type GenerateSummaryResponse = z.infer<
  typeof generateSummaryResponseSchema
>;

/**
 * A project's shared daily rebuild budget: manual summary updates and recap
 * builds both draw it down, so both tabs show the same number.
 */
export const updateUsageSchema = z.object({
  used: z.number(),
  limit: z.number(),
  remaining: z.number(),
});
export type UpdateUsage = z.infer<typeof updateUsageSchema>;

export type Meta = z.infer<typeof metaSchema>;

export type Paginated<T> = { data: T[]; meta: Meta };

export const planLimitsSchema = z.object({
  /** null = unlimited */
  max_projects: z.number().nullable(),
  /** null = full history */
  history_days: z.number().nullable(),
  /** On-demand rebuilds per day — daily updates and recaps share this. */
  updates_per_day: z.number(),
  first_person_voice: z.boolean(),
  /** Multi-day recaps. Nullish on responses from an older API. */
  recaps: z.boolean().nullish(),
  /** Longest span one recap may cover, in days. */
  recap_max_days: z.number().nullish(),
});
export type PlanLimits = z.infer<typeof planLimitsSchema>;

export const billingSchema = z.object({
  plan: z.enum(["free", "pro"]),
  limits: planLimitsSchema,
  trial_ends_at: z.string().nullish(),
  in_trial: z.boolean(),
  subscription_status: z.string().nullish(),
  current_period_end: z.string().nullish(),
  has_subscription: z.boolean(),
  founding_member: z.boolean(),
});
export type Billing = z.infer<typeof billingSchema>;

/** A promo link (writelogs.com/promo/<code>): Pro for `grant_days`, no card. */
export type Promo = {
  code: string;
  grant_days: number;
  expires_at: string | null;
  available: boolean;
  /** Why it can't be claimed, when `available` is false. */
  reason: string | null;
};

export type PromoRedemption = { grant_days: number; trial_ends_at: string };

export type BillingCheckout = {
  environment: "sandbox" | "production";
  client_token: string;
  prices: { monthly: string; yearly: string };
  customer: { email: string };
  custom_data: Record<string, string>;
};

/** Summaries list: pagination plus the free-plan history window. */
export type SummaryList = Paginated<Summary> & {
  /** Summaries hidden by the plan's history window. */
  locked: number;
  limits?: PlanLimits;
};

export const projectAreaSchema = z.object({
  name: z.string(),
  uses: z.number(),
});
/** A name the project uses for a part of its product ("Billing"). */
export type ProjectArea = z.infer<typeof projectAreaSchema>;

export type RenameAreaResult = {
  renamed: string;
  /** folded into an area that already existed */
  merged: boolean;
  bullets: number;
};

// ---------------------------------------------------------------------------
// Recaps — one summary across a span of days ("what did I do last week")
// ---------------------------------------------------------------------------

export const recapTaskSchema = summaryTaskSchema.extend({
  /** The project days this theme showed up on. */
  days: z.array(z.string()).nullish(),
});
export type RecapTask = z.infer<typeof recapTaskSchema>;

export const recapSchema = z.object({
  id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  timezone: z.string(),
  title: z.string(),
  message: z.string(),
  message_first_person: z.string().nullish(),
  status: z.string(),
  /** Days with activity inside the span — not the length of the span. */
  days_count: z.number(),
  /** Product areas the period touched, biggest first. Empty on older recaps. */
  areas: z.array(z.string()).nullish(),
  logs_count: z.number(),
  tasks: z.array(recapTaskSchema),
  /** Only on the single-summary read, not the list. */
  project: z.object({ name: z.string() }).nullish(),
  created_at: z.string(),
});
export type Recap = z.infer<typeof recapSchema>;

export const sharedRecapSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  title: z.string(),
  message: z.string(),
  author_name: z.string().nullish(),
  days_count: z.number(),
  areas: z.array(z.string()).nullish(),
  tasks: z.array(z.object({ task: z.string(), time_minutes: z.number() })),
  stats: z.object({
    commits: z.number(),
    files: z.number(),
    ai_changes: z.number(),
  }),
  active_minutes: z.number(),
});
export type SharedRecap = z.infer<typeof sharedRecapSchema>;

export const sharedSummarySchema = z.object({
  date: z.string(),
  title: z.string(),
  message: z.string(),
  author_name: z.string(),
  tasks: z.array(z.object({ task: z.string(), time_minutes: z.number() })),
  stats: z.object({
    commits: z.number(),
    files: z.number(),
    ai_changes: z.number(),
  }),
  active_minutes: z.number(),
});
export type SharedSummary = z.infer<typeof sharedSummarySchema>;

export type ShareLink = { token: string; url: string };

// ---------------------------------------------------------------------------
// Feedback board
// ---------------------------------------------------------------------------

export const feedbackCategorySchema = z.enum(["FEATURE", "BUG", "IMPROVEMENT"]);
export const feedbackStatusSchema = z.enum([
  "OPEN",
  "PLANNED",
  "IN_PROGRESS",
  "DONE",
  "DECLINED",
]);
export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>;
export type FeedbackStatus = z.infer<typeof feedbackStatusSchema>;
export type FeedbackSort = "top" | "new";

export const feedbackAuthorSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  profile_picture: z.string().nullish(),
});
export type FeedbackAuthor = z.infer<typeof feedbackAuthorSchema>;

export const feedbackPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  category: feedbackCategorySchema,
  status: feedbackStatusSchema,
  /** Admin's public note under the status ("Shipping in 2.3"). */
  status_note: z.string().nullish(),
  vote_count: z.number(),
  comment_count: z.number(),
  /** The caller has upvoted this post. */
  has_voted: z.boolean(),
  /** The caller wrote this post (show edit/delete). */
  is_mine: z.boolean(),
  author: feedbackAuthorSchema,
  created_at: z.string(),
  updated_at: z.string(),
});
export type FeedbackPost = z.infer<typeof feedbackPostSchema>;

export const feedbackCommentSchema = z.object({
  id: z.string(),
  body: z.string(),
  /** Official reply from WriteLogs — render with a small "Team" badge. */
  is_admin: z.boolean(),
  is_mine: z.boolean(),
  author: feedbackAuthorSchema,
  created_at: z.string(),
});
export type FeedbackComment = z.infer<typeof feedbackCommentSchema>;

export type FeedbackMe = {
  is_admin: boolean;
  categories: FeedbackCategory[];
  statuses: FeedbackStatus[];
};
export type FeedbackVoteResult = {
  id: string;
  vote_count: number;
  has_voted: boolean;
};

// ---------------------------------------------------------------------------
// Creator acquisition (admin only)
// ---------------------------------------------------------------------------

export const creatorStatusSchema = z.enum([
  "DISCOVERED",
  "SHORTLISTED",
  "CONTACTED",
  "REPLIED",
  "TRIAL_SENT",
  "ACTIVATED",
  "SHARED",
  "CONVERTED",
  "REJECTED",
]);
export type CreatorStatus = z.infer<typeof creatorStatusSchema>;
export type CreatorSort = "score" | "new";

export type CreatorPost = {
  title?: string;
  url?: string;
  text?: string;
  posted_at?: string;
  reactions?: number;
  comments?: number;
};

/** Only what the creator lists publicly. */
export type CreatorContact = {
  email?: string;
  website?: string;
  twitter?: string;
  github?: string;
};

export type ReferralStats = {
  /** Times the link was opened. */
  clicks: number;
  /** Accounts that claimed it. */
  signups: number;
  /** Of those, sent editor activity. */
  activations: number;
  /** Summaries and recaps they shared publicly. */
  shares: number;
  /** Of those, on a paid plan. */
  paid: number;
};

export type CreatorReferral = ReferralStats & {
  code: string;
  url: string;
  grant_days: number;
};

export type CreatorScoreDimension =
  | "developer_relevance"
  | "actively_building"
  | "documents_publicly"
  | "audience_relevance"
  | "recent_activity"
  | "engagement"
  | "writelogs_fit";

export type Creator = {
  id: string;
  platform: string;
  username: string;
  name: string;
  profile_url: string;
  avatar_url: string | null;
  followers: number | null;
  bio: string;
  recent_posts: CreatorPost[];
  engagement: string | null;
  current_project: string | null;
  /** Where they were found, e.g. "devto: #100daysofcode". */
  source: string;
  contact: CreatorContact;
  status: CreatorStatus;
  /** 0-100, null until scored. */
  score: number | null;
  /** The 0-10 grades the score is weighted from. */
  score_breakdown: Record<CreatorScoreDimension, number> | null;
  score_reason: string | null;
  fit_reason: string | null;
  scored_at: string | null;
  /** A background score is in flight; poll until it clears. */
  scoring: boolean;
  outreach_draft: string | null;
  notes: string | null;
  contacted_at: string | null;
  referral: CreatorReferral | null;
  created_at: string;
  updated_at: string;
};

export type CreatorProvider = { id: string; label: string; hint: string };

export type CreatorOverview = {
  funnel: {
    discovered: number;
    high_fit: number;
    contacted: number;
    trials: number;
    activated: number;
    shared: number;
    converted: number;
  };
  by_status: Record<CreatorStatus, number>;
  /** Every creator link summed. */
  referrals: ReferralStats;
  todays_prospects: Creator[];
  providers: CreatorProvider[];
  high_fit_score: number;
};

export type CreatorDiscovery = { found: number; added: number };

/** The free "paste your git log" tool: a standup written from commits alone. */
export const gitStandupTaskSchema = z.object({
  task: z.string(),
  area: z.string(),
  files: z.array(z.string()),
});
export const gitStandupSchema = z.object({
  title: z.string(),
  message: z.string(),
  tasks: z.array(gitStandupTaskSchema),
  commits: z.number(),
  vague_commits: z.number(),
  vague_example: z.string().nullable(),
  files: z.number(),
  gap: z
    .object({ minutes: z.number(), before: z.string(), after: z.string() })
    .nullable(),
  messages_only: z.boolean(),
});
export type GitStandup = z.infer<typeof gitStandupSchema>;

/** One project week in numbers, the source of the "your week" roast. */
export const weekSchema = z.object({
  start: z.string(),
  end: z.string(),
  project_name: z.string(),
  author_name: z.string(),
  shipped: z.number(),
  days_active: z.number(),
  days: z.array(
    z.object({ day: z.string(), tasks: z.number(), commits: z.number() }),
  ),
  commits: z.number(),
  vague_commits: z.number(),
  top_commit_message: z
    .object({ message: z.string(), count: z.number() })
    .nullable(),
  late_commits: z.number(),
  weekend_commits: z.number(),
  files: z.number(),
  top_file: z.object({ path: z.string(), edits: z.number() }).nullable(),
  areas: z.array(z.object({ area: z.string(), tasks: z.number() })),
  longest_task: z.string().nullable(),
  /** This week's persona's lines, written for this week. Null: use stock lines. */
  roast: z
    .object({ persona_id: z.string(), lines: z.record(z.string(), z.string()) })
    .nullable(),
});
export type Week = z.infer<typeof weekSchema>;
