"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { areas } from "@/lib/api-client";

export const areasKey = (projectId: string) => ["areas", projectId];

/**
 * The project's area names with their bullet counts. Used to tell someone how
 * much a rename touches before they commit to it, so `enabled` keeps it from
 * firing until a rename dialog actually opens.
 */
export function useProjectAreas(projectId: string, enabled = true) {
  return useQuery({
    queryKey: areasKey(projectId),
    queryFn: () => areas.listByProject(projectId),
    enabled,
    staleTime: 60_000,
  });
}

/**
 * Renaming rewrites every bullet carrying the old name, so summaries and
 * recaps go stale at the same time. The new name is also what the next
 * generation is offered as vocabulary, which is what stops the model
 * reverting to the old one.
 */
export function useRenameArea(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { from: string; to: string }) =>
      areas.rename(projectId, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: areasKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ["summaries", projectId] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["recaps", projectId] });
      queryClient.invalidateQueries({ queryKey: ["recap"] });
      toast.success(
        result.merged
          ? `Merged into ${result.renamed}, ${result.bullets} ${result.bullets === 1 ? "bullet" : "bullets"} moved.`
          : `Renamed to ${result.renamed}.`,
      );
    },
    onError: (error) => toast.error(error.message),
  });
}
