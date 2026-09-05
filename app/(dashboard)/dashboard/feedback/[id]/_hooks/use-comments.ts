"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { feedback } from "@/lib/api-client";

/** Oldest first; "Load more" appends the next page under the thread. */
export function useComments(postId: string) {
  return useInfiniteQuery({
    queryKey: ["feedback", postId, "comments"],
    queryFn: ({ pageParam }) =>
      feedback.comments(postId, { page: pageParam, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.has_next_page ? last.meta.page + 1 : undefined,
  });
}
