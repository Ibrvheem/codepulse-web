"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, feedback } from "@/lib/api-client";

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  const finish = () => {
    queryClient.invalidateQueries({ queryKey: ["feedback"] });
  };

  return useMutation({
    mutationFn: (commentId: string) => feedback.removeComment(postId, commentId),
    onSuccess: finish,
    onError: (error) => {
      // Already gone — same outcome as success.
      if (error instanceof ApiError && error.status === 404) return finish();
      toast.error(error.message);
    },
  });
}
