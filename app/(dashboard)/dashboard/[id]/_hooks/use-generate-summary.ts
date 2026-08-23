"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { summaries } from "@/lib/api-client";

export function useGenerateSummary(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      summaries.generate({ project_id: projectId, include_today: true }),
    onSuccess: (result) => {
      if (result.generated === 0) {
        toast.info("Nothing to summarize yet — log some activity first.");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["summaries", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success(
        result.generated === 1
          ? "Today's summary is ready."
          : `${result.generated} summaries generated.`,
      );
    },
    onError: (error) => toast.error(error.message),
  });
}
