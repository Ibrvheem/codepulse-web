"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feedback } from "@/lib/api-client";
import type { FeedbackPost } from "@/lib/types";
import { setStatusPayloadSchema, type SetStatusPayload } from "../../types";

/**
 * Admin only. The API emails the author when the status lands on
 * Planned / In progress / Done — nothing extra to do here.
 */
export function useSetStatus(post: FeedbackPost) {
  const queryClient = useQueryClient();

  const form = useForm<SetStatusPayload>({
    resolver: zodResolver(setStatusPayloadSchema),
    // `values` (not defaultValues) so a fresh post keeps the form in sync.
    values: { status: post.status, note: post.status_note ?? "" },
  });

  const mutation = useMutation({
    mutationFn: (payload: SetStatusPayload) =>
      feedback.setStatus(post.id, {
        status: payload.status,
        note: payload.note ? payload.note : undefined,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<FeedbackPost>(["feedback", post.id], updated);
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast.success("Status updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
