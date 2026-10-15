import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { ApiError, tools } from "@/lib/api-client";
import { track } from "@/lib/analytics";
import type { GitStandup } from "@/lib/types";

import {
  TOOL_ID,
  gitStandupPayload,
  type GitStandupPayload,
} from "../types";

const RATE_LIMITED =
  "You've used the free tool a lot this hour. Install the extension and it writes this for you every day.";

export function useGitStandup() {
  const [result, setResult] = useState<GitStandup | null>(null);
  const form = useForm<GitStandupPayload>({
    resolver: zodResolver(gitStandupPayload),
    defaultValues: { log: "" },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async ({ log }) => {
    try {
      const data = await tools.gitStandup(log);
      setResult(data);
      // The form is replaced by the result, so bring the top of the tool
      // back into view: the reader was down at the submit button.
      document
        .getElementById(TOOL_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      track("git_standup_generated", {
        commits: data.commits,
        vague_commits: data.vague_commits,
        files: data.files,
        messages_only: data.messages_only,
      });
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      const message =
        status === 429
          ? RATE_LIMITED
          : err instanceof ApiError
            ? err.message
            : "Something went wrong. Try again.";
      track("git_standup_failed", { status });
      toast.error(message);
    }
  });

  const reset = () => {
    setResult(null);
    form.reset();
  };

  return { form, onSubmit, isSubmitting, result, reset };
}
