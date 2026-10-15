"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { creators } from "@/lib/api-client";
import type { Creator, CreatorStatus } from "@/lib/types";
import { STATUS_META } from "../types";

/** Puts a fresh copy of one creator in the cache and refreshes every list. */
export function useSyncCreator() {
  const queryClient = useQueryClient();
  return (creator: Creator) => {
    queryClient.setQueryData<Creator>(["creators", creator.id], creator);
    queryClient.invalidateQueries({ queryKey: ["creators", "list"] });
    queryClient.invalidateQueries({ queryKey: ["creators", "overview"] });
  };
}

export function useMoveCreator(id: string) {
  const sync = useSyncCreator();
  return useMutation({
    mutationFn: (status: CreatorStatus) => creators.update(id, { status }),
    onSuccess: (creator) => {
      sync(creator);
      toast.success(`Moved to ${STATUS_META[creator.status].label}`);
    },
    onError: (error) => toast.error(error.message),
  });
}
