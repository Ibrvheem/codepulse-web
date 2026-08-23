"use client";

import { useQuery } from "@tanstack/react-query";
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

export function useProjectLogs(projectId: string, page: number) {
  return useQuery({
    queryKey: ["logs", projectId, page],
    queryFn: () => projects.logs(projectId, { page, limit: 20 }),
  });
}

export function useProjectKeys(projectId: string) {
  return useQuery({
    queryKey: ["keys", projectId],
    queryFn: () => pat.list(projectId, { limit: 50 }),
  });
}
