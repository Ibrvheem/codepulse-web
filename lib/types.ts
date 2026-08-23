import { z } from "zod";
import { metaSchema } from "./schemas";

export const userSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string(),
  phone_no: z.string().nullish(),
  profile_picture: z.string().nullish(),
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

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  repo_url: z.string().nullish(),
  timezone: z.string(),
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
