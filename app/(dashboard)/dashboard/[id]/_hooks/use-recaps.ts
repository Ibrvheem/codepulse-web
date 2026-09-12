"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, recaps } from "@/lib/api-client";
import { useUpgradeToast } from "../../../_hooks/use-upgrade-toast";
import type { RecapRange } from "../_lib/recap-range";

export function useProjectRecaps(projectId: string, page: number) {
  return useQuery({
    queryKey: ["recaps", projectId, page],
    queryFn: () => recaps.listByProject(projectId, { page, limit: 10 }),
  });
}

/**
 * Build a recap and go straight to it — the wait is an LLM call over the
 * whole span, so landing on the finished page is the payoff.
 */
export function useCreateRecap(projectId: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  const upgradeToast = useUpgradeToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (range: RecapRange) =>
      recaps.create({
        project_id: projectId,
        start_date: range.start,
        end_date: range.end,
      }),
    onSuccess: (recap) => {
      queryClient.invalidateQueries({ queryKey: ["recaps", projectId] });
      queryClient.setQueryData(["recap", recap.id], recap);
      onDone?.();
      router.push(`/dashboard/${projectId}/recap/${recap.id}`);
    },
    onError: (error) => {
      if (upgradeToast(error)) return;
      // 404 = the span has no day summaries yet; the API's copy says so.
      if (error instanceof ApiError && error.status === 404) {
        toast.info(error.message);
        return;
      }
      toast.error(error.message);
    },
  });
}

export function useDeleteRecap(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recaps.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recaps", projectId] });
      toast.success("Recap deleted.");
    },
    onError: (error) => {
      // Already gone — same outcome as success.
      if (error instanceof ApiError && error.status === 404) {
        queryClient.invalidateQueries({ queryKey: ["recaps", projectId] });
        return;
      }
      toast.error(error.message);
    },
  });
}
