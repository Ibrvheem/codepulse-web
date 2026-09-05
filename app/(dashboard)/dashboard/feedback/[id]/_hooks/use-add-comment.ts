"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { feedback } from "@/lib/api-client";
import { commentPayloadSchema, type CommentPayload } from "../../types";

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();

  const form = useForm<CommentPayload>({
    resolver: zodResolver(commentPayloadSchema),
    defaultValues: { body: "" },
  });

  const mutation = useMutation({
    mutationFn: (payload: CommentPayload) => feedback.addComment(postId, payload),
    onSuccess: () => {
      form.reset();
      // Covers the thread and the post's comment_count (list + detail).
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    // 429 (20 comments/hour) arrives here with the API's own message.
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
