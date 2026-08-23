"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, summaries } from "@/lib/api-client";
import type { SummaryUsage } from "@/lib/types";

const usageKey = (projectId: string) => ["summary-usage", projectId];

/** Reactive read of the cached usage counter (written by useGenerateSummary). */
export function useSummaryUsage(projectId: string) {
  return useQuery<SummaryUsage>({
    queryKey: usageKey(projectId),
    // Cache-only: the API reports usage on generate responses, not via a GET.
    enabled: false,
  }).data;
}

export function useGenerateSummary(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      summaries.generate({ project_id: projectId, include_today: true }),
    onSuccess: (result) => {
      queryClient.setQueryData<SummaryUsage>(usageKey(projectId), {
        used: result.manual_runs_used,
        limit: result.manual_runs_limit,
        exhausted: result.manual_runs_used >= result.manual_runs_limit,
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
        queryClient.setQueryData<SummaryUsage>(usageKey(projectId), (prev) => ({
          used: prev?.limit ?? null,
          limit: prev?.limit ?? null,
          exhausted: true,
        }));
        toast.warning(error.message);
        return;
      }
      toast.error(error.message);
    },
  });
}
