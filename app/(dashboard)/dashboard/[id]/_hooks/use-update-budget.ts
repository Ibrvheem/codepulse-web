"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { summaries } from "@/lib/api-client";
import type { UpdateUsage } from "@/lib/types";

/**
 * The project's one daily budget for on-demand rebuilds. A manual summary
 * update and a recap build cost the same LLM call, so they draw from the same
 * count — which is why both tabs read this single query rather than caching
 * their own number.
 */
export const budgetKey = (projectId: string) => ["update-budget", projectId];

export function useUpdateBudget(projectId: string) {
  return useQuery({
    queryKey: budgetKey(projectId),
    queryFn: () => summaries.usage(projectId),
    staleTime: 30_000,
  });
}

/** Refresh the budget after anything that spends it. */
export function useRefreshBudget(projectId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: budgetKey(projectId) });
}

/** What to show when a build is refused: the budget is gone for today. */
export function markBudgetSpent(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  queryClient.setQueryData<UpdateUsage>(budgetKey(projectId), (prev) =>
    prev ? { ...prev, used: prev.limit, remaining: 0 } : prev,
  );
}
