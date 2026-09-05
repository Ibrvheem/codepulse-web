"use client";

import { useQuery } from "@tanstack/react-query";
import { feedback } from "@/lib/api-client";

export function useFeedbackPost(id: string) {
  return useQuery({
    queryKey: ["feedback", id],
    queryFn: () => feedback.get(id),
  });
}
