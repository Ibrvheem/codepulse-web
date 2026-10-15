"use client";

import { useQuery } from "@tanstack/react-query";
import { creators } from "@/lib/api-client";

/** How often to look again while someone on screen is still being scored. */
export const SCORING_POLL_MS = 4000;

export function useCreatorsOverview() {
  return useQuery({
    queryKey: ["creators", "overview"],
    queryFn: creators.overview,
    refetchInterval: (query) =>
      query.state.data?.todays_prospects.some((c) => c.scoring)
        ? SCORING_POLL_MS
        : false,
  });
}
