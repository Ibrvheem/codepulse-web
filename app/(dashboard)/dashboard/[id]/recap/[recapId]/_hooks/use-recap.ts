"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { recaps } from "@/lib/api-client";
import { copyText } from "@/lib/utils";
import { useUpgradeToast } from "../../../../../_hooks/use-upgrade-toast";

export function useRecap(recapId: string) {
  return useQuery({
    queryKey: ["recap", recapId],
    queryFn: () => recaps.get(recapId),
  });
}

export function useCopyRecap(recapId: string) {
  const upgradeToast = useUpgradeToast();
  return useMutation({
    mutationFn: () => recaps.standup(recapId),
    onSuccess: async (text) => {
      if (await copyText(text)) {
        toast.success("Recap copied — paste it anywhere.");
      } else {
        toast.error("Couldn't access the clipboard. Try again.");
      }
    },
    onError: (error) => {
      if (!upgradeToast(error)) toast.error(error.message);
    },
  });
}
