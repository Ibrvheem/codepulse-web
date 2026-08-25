"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projects } from "@/lib/api-client";
import type { Project, SummaryVoice } from "@/lib/types";
import { useProject } from "./use-project-data";

/**
 * Pick the text for the active voice. First-person fields are empty on
 * summaries generated before the two-voice rollout — fall back to "you".
 */
export function inVoice(
  voice: SummaryVoice,
  you: string,
  firstPerson: string | null | undefined,
): string {
  return voice === "i" && firstPerson?.trim() ? firstPerson : you;
}

/** The project's saved voice preference, with optimistic switching. */
export function useSummaryVoice(projectId: string) {
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId);
  const key = ["project", projectId];

  const mutation = useMutation({
    mutationFn: (summary_voice: SummaryVoice) =>
      projects.update(projectId, { summary_voice }),
    onMutate: async (summary_voice) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Project>(key);
      queryClient.setQueryData<Project>(key, (old) =>
        old ? { ...old, summary_voice } : old,
      );
      return { previous };
    },
    onError: (error, _voice, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Project>(key, (old) =>
        old ? { ...old, ...updated } : updated,
      );
    },
  });

  return {
    voice: (project?.summary_voice ?? "you") as SummaryVoice,
    setVoice: mutation.mutate,
    isReady: project !== undefined,
  };
}
