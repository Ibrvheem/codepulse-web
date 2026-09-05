"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError, feedback } from "@/lib/api-client";

export function useDeleteFeedback(postId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const finish = () => {
    toast.success("Post deleted");
    queryClient.removeQueries({ queryKey: ["feedback", postId] });
    queryClient.invalidateQueries({ queryKey: ["feedback"] });
    router.push("/dashboard/feedback");
  };

  return useMutation({
    mutationFn: () => feedback.remove(postId),
    onSuccess: finish,
    onError: (error) => {
      // Already gone (deleted elsewhere) — same outcome as success.
      if (error instanceof ApiError && error.status === 404) return finish();
      toast.error(error.message);
    },
  });
}
