"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { pat, projects, summaries } from "@/lib/api-client";

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projects.get(id),
  });
}

export function useProjectSummaries(projectId: string, page: number) {
  return useQuery({
    queryKey: ["summaries", projectId, page],
    queryFn: () => summaries.listByProject(projectId, { page, limit: 10 }),
  });
}

/**
 * The Activity timeline groups client-side (commits anchor editor/agent
 * rows), so pages accumulate instead of replacing each other — grouping
 * always runs over every row loaded so far.
 */
export function useProjectLogsInfinite(projectId: string) {
  return useInfiniteQuery({
    queryKey: ["logs", projectId],
    queryFn: ({ pageParam }) =>
      projects.logs(projectId, { page: pageParam, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.has_next_page ? last.meta.page + 1 : undefined,
    // The extension syncs roughly once a minute, so a 30s poll reads as live.
    // React Query pauses the interval while the tab is hidden and already
    // refetches on window focus — no socket needed at this cadence.
    refetchInterval: 30_000,
  });
}

export function useProjectKeys(projectId: string) {
  return useQuery({
    queryKey: ["keys", projectId],
    queryFn: () => pat.list(projectId, { limit: 50 }),
  });
}
