"use client";

import { useQuery } from "@tanstack/react-query";
import { creators } from "@/lib/api-client";
import { SCORING_POLL_MS } from "../../_hooks/use-overview";

export function useCreator(id: string) {
  return useQuery({
    queryKey: ["creators", id],
    queryFn: () => creators.get(id),
    refetchInterval: (query) =>
      query.state.data?.scoring ? SCORING_POLL_MS : false,
  });
}
