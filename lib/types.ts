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
  created_at: z.string(),
});
export type Summary = z.infer<typeof summarySchema>;

export const generateSummaryResponseSchema = z.object({
  generated: z.number(),
  summary_ids: z.array(z.string()),
  manual_runs_used: z.number(),
  manual_runs_limit: z.number(),
});
export type GenerateSummaryResponse = z.infer<
  typeof generateSummaryResponseSchema
>;

/** Session-cached manual "Update summary" usage, keyed ["summary-usage", projectId]. */
export type SummaryUsage = {
  used: number | null;
  limit: number | null;
  exhausted: boolean;
};

export type Meta = z.infer<typeof metaSchema>;

export type Paginated<T> = { data: T[]; meta: Meta };

export const planLimitsSchema = z.object({
  /** null = unlimited */
  max_projects: z.number().nullable(),
  /** null = full history */
  history_days: z.number().nullable(),
  manual_updates_per_day: z.number(),
  first_person_voice: z.boolean(),
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
