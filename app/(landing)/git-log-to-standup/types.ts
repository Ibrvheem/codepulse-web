import { z } from "zod";

export const MAX_LOG_CHARS = 40_000;

export const gitStandupPayload = z.object({
  log: z
    .string()
    .trim()
    .min(10, "Paste the output of the command above.")
    .max(MAX_LOG_CHARS, "That's a lot of history. Paste the last day or two."),
});
export type GitStandupPayload = z.infer<typeof gitStandupPayload>;

/** What to run before pasting. --stat adds file names so vague commits still make sense. */
export const GIT_COMMAND =
  'git log --since="yesterday" --author="$(git config user.email)" --stat --no-merges';

/** DOM id of the tool, scrolled back into view once the update is written. */
export const TOOL_ID = "git-standup-tool";
