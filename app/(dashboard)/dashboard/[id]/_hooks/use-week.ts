"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { weeks } from "@/lib/api-client";
import { track } from "@/lib/analytics";

export function useWeek(projectId: string, day?: string) {
  return useQuery({
    queryKey: ["week", projectId, day ?? "current"],
    queryFn: () => weeks.get(projectId, day),
  });
}

/** Mint the public link and hand it back. The link is signed, so this never fails on storage. */
export function useShareWeek(projectId: string, day?: string) {
  return useMutation({
    mutationFn: () => weeks.share(projectId, day),
    onSuccess: () => track("week_shared", { project_id: projectId }),
    onError: (error) => toast.error(error.message),
  });
}

/** The week's signed token, for the voice route. Same call as sharing. */
export function useWeekToken(projectId: string, day?: string) {
  return useQuery({
    queryKey: ["week-token", projectId, day ?? "current"],
    queryFn: () => weeks.share(projectId, day),
    staleTime: Infinity,
  });
}
