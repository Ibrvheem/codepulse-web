"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feedback } from "@/lib/api-client";
import type { FeedbackPost, Paginated } from "@/lib/types";

/**
 * Optimistic toggle. Patches every cached list page and the detail entry,
 * then reconciles with the server on settle. Both endpoints are idempotent,
 * so a rapid double-click converges on the right state.
 */
export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (p: { id: string; has_voted: boolean }) =>
      p.has_voted ? feedback.unvote(p.id) : feedback.vote(p.id),
    onMutate: async ({ id, has_voted }) => {
      await queryClient.cancelQueries({ queryKey: ["feedback"] });
      const delta = has_voted ? -1 : 1;
      const patch = (p: FeedbackPost) =>
        p.id === id
          ? { ...p, has_voted: !has_voted, vote_count: p.vote_count + delta }
          : p;

      queryClient.setQueriesData<Paginated<FeedbackPost>>(
        { queryKey: ["feedback", "list"] },
        (old) => (old ? { ...old, data: old.data.map(patch) } : old),
      );
      queryClient.setQueryData<FeedbackPost>(["feedback", id], (old) =>
        old ? patch(old) : old,
      );
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["feedback"] }),
  });
}
