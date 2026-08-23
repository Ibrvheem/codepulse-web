"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError, projects } from "@/lib/api-client";

export function useDeleteProject(projectId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const finish = () => {
    toast.success("Project deleted");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    // Drop everything cached under the deleted project.
    for (const key of ["project", "summaries", "logs", "keys", "summary-usage"]) {
      queryClient.removeQueries({ queryKey: [key, projectId] });
    }
    router.push("/dashboard");
  };

  return useMutation({
    mutationFn: () => projects.remove(projectId),
    onSuccess: finish,
    onError: (error) => {
      // Already gone (deleted elsewhere) — same outcome as success.
      if (error instanceof ApiError && error.status === 404) {
        finish();
        return;
      }
      toast.error(error.message);
    },
  });
}
