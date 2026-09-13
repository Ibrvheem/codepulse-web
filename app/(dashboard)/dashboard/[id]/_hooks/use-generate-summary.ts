"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, summaries } from "@/lib/api-client";
import type { UpdateUsage } from "@/lib/types";
import { budgetKey, markBudgetSpent } from "./use-update-budget";

export function useGenerateSummary(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      summaries.generate({ project_id: projectId, include_today: true }),
    onSuccess: (result) => {
      // The response carries the fresh count, so there's no need to refetch it.
      queryClient.setQueryData<UpdateUsage>(budgetKey(projectId), {
        used: result.updates_used,
        limit: result.updates_limit,
        remaining: Math.max(0, result.updates_limit - result.updates_used),
      });
      if (result.generated === 0) {
        toast.info("No activity captured yet today.");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["summaries", projectId] });
      // The rebuild keeps the same summary id and replaces its tasks, so any
      // cached summary detail is stale too.
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Today's summary is up to date.");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 429) {
        // Expected, user-facing copy from the API — render as-is.
        markBudgetSpent(queryClient, projectId);
        toast.warning(error.message);
        return;
      }
      toast.error(error.message);
    },
  });
}
