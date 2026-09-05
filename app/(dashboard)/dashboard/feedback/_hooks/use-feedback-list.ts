"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { feedback } from "@/lib/api-client";
import { PAGE_SIZE, type FeedbackFilters } from "../types";

export function useFeedbackList(filters: FeedbackFilters) {
  return useQuery({
    queryKey: ["feedback", "list", filters],
    queryFn: () =>
      feedback.list({
        page: filters.page,
        limit: PAGE_SIZE,
        status: filters.status,
        category: filters.category,
        sort: filters.sort,
      }),
    // Switching a filter keeps the old rows on screen instead of flashing
    // the skeleton.
    placeholderData: keepPreviousData,
  });
}
