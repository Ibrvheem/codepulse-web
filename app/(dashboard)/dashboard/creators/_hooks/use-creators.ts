"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { creators } from "@/lib/api-client";
import { PAGE_SIZE, type CreatorFilters } from "../types";
import { SCORING_POLL_MS } from "./use-overview";

export function useCreators(filters: CreatorFilters) {
  return useQuery({
    queryKey: ["creators", "list", filters],
    queryFn: () =>
      creators.list({
        page: filters.page,
        limit: PAGE_SIZE,
        status: filters.status,
        q: filters.q,
        sort: filters.sort,
      }),
    // Switching a filter keeps the old rows on screen instead of flashing
    // the skeleton.
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.data.some((c) => c.scoring) ? SCORING_POLL_MS : false,
  });
}
