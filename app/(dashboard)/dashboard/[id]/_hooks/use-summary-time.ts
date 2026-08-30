"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projects } from "@/lib/api-client";
import { formatDayEnd } from "@/lib/project-day";
import type { Project } from "@/lib/types";
import { useProject } from "./use-project-data";

/** When the project's day closes ("HH:mm", project tz), with optimistic switching. */
export function useSummaryTime(projectId: string) {
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId);
  const key = ["project", projectId];

  const mutation = useMutation({
    mutationFn: (summary_time: string) =>
      projects.update(projectId, { summary_time }),
    onMutate: async (summary_time) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Project>(key);
      queryClient.setQueryData<Project>(key, (old) =>
        old ? { ...old, summary_time } : old,
      );
      return { previous };
    },
    onError: (error, _time, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Project>(key, (old) =>
        old ? { ...old, ...updated } : updated,
      );
      toast.success(
        `Day now ends at ${formatDayEnd(updated.summary_time)} — your summary arrives right after.`,
      );
    },
  });

  return {
    time: project?.summary_time ?? "00:00",
    setTime: mutation.mutate,
    isReady: project !== undefined,
  };
}
