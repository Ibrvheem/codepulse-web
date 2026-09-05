"use client";

import { useQuery } from "@tanstack/react-query";
import { feedback } from "@/lib/api-client";

/** Gates the admin UI. Cached for the session — admin status doesn't flip. */
export function useFeedbackMe() {
  return useQuery({
    queryKey: ["feedback", "me"],
    queryFn: feedback.me,
    staleTime: Infinity,
  });
}
