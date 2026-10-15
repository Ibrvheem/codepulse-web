"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { creators } from "@/lib/api-client";
import type { Creator } from "@/lib/types";
import { useSyncCreator } from "../../_hooks/use-move-creator";
import { outreachPayloadSchema, type OutreachPayload } from "../../types";

/** The message as the reviewer edits it. Saving stores it; nothing sends. */
export function useOutreachForm(creator: Creator) {
  const sync = useSyncCreator();

  const form = useForm<OutreachPayload>({
    resolver: zodResolver(outreachPayloadSchema),
    // `values` (not defaultValues) so a fresh draft replaces the text.
    values: { outreach_draft: creator.outreach_draft ?? "" },
  });

  const mutation = useMutation({
    mutationFn: (payload: OutreachPayload) =>
      creators.update(creator.id, payload),
    onSuccess: (updated) => {
      sync(updated);
      toast.success("Draft saved");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
