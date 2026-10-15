"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { creators } from "@/lib/api-client";
import type { Creator } from "@/lib/types";
import { useSyncCreator } from "../../_hooks/use-move-creator";
import { notesPayloadSchema, type NotesPayload } from "../../types";

export function useNotesForm(creator: Creator) {
  const sync = useSyncCreator();

  const form = useForm<NotesPayload>({
    resolver: zodResolver(notesPayloadSchema),
    values: { notes: creator.notes ?? "" },
  });

  const mutation = useMutation({
    mutationFn: (payload: NotesPayload) => creators.update(creator.id, payload),
    onSuccess: (updated) => {
      sync(updated);
      toast.success("Notes saved");
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
