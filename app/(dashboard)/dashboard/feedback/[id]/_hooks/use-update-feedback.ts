"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feedback } from "@/lib/api-client";
import type { FeedbackPost } from "@/lib/types";
import {
  createFeedbackPayloadSchema,
  type CreateFeedbackPayload,
} from "../../types";

/** Same form as "New post", seeded from the post. */
export function useUpdateFeedback(post: FeedbackPost, onSaved?: () => void) {
  const queryClient = useQueryClient();

  const form = useForm<CreateFeedbackPayload>({
    resolver: zodResolver(createFeedbackPayloadSchema),
    values: { title: post.title, category: post.category, body: post.body },
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateFeedbackPayload) =>
      feedback.update(post.id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<FeedbackPost>(["feedback", post.id], updated);
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast.success("Post updated");
      onSaved?.();
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
