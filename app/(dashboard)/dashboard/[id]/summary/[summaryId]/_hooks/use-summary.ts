"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { summaries } from "@/lib/api-client";
import { copyText } from "@/lib/utils";

export function useSummary(summaryId: string) {
  return useQuery({
    queryKey: ["summary", summaryId],
    queryFn: () => summaries.get(summaryId),
  });
}

export function useCopyStandup(summaryId: string) {
  return useMutation({
    mutationFn: () => summaries.standup(summaryId),
    onSuccess: async (text) => {
      const ok = await copyText(text);
      if (ok) {
        toast.success("Standup copied — paste it anywhere.");
      } else {
        toast.error("Couldn't access the clipboard. Try again.");
      }
    },
    onError: (error) => toast.error(error.message),
  });
}
