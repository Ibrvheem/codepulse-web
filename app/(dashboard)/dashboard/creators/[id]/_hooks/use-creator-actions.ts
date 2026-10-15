"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { creators } from "@/lib/api-client";
import { useSyncCreator } from "../../_hooks/use-move-creator";

/** The one-click actions on a creator. Each returns the updated creator. */
export function useCreatorActions(id: string) {
  const sync = useSyncCreator();
  const onError = (error: Error) => toast.error(error.message);

  const score = useMutation({
    mutationFn: () => creators.score(id),
    onSuccess: (creator) => {
      sync(creator);
      toast.success(`Scored ${creator.score}`);
    },
    onError,
  });

  const draft = useMutation({
    mutationFn: () => creators.outreach(id),
    onSuccess: (creator) => {
      sync(creator);
      toast.success("Draft ready. Read it before you send it.");
    },
    onError,
  });

  const referral = useMutation({
    mutationFn: () => creators.referral(id),
    onSuccess: (creator) => {
      sync(creator);
      toast.success("Referral link created");
    },
    onError,
  });

  const trial = useMutation({
    mutationFn: () => creators.trial(id),
    onSuccess: (creator) => {
      sync(creator);
      toast.success("Trial link ready. Send it to them yourself.");
    },
    onError,
  });

  return { score, draft, referral, trial };
}
