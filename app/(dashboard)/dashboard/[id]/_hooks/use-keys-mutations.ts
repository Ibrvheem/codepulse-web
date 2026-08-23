"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pat } from "@/lib/api-client";
import type { CreatedPatKey } from "@/lib/types";
import { createKeyPayloadSchema, type CreateKeyPayload } from "../types";

export function useCreateKey(
  projectId: string,
  onCreated: (key: CreatedPatKey) => void,
) {
  const queryClient = useQueryClient();

  const form = useForm<CreateKeyPayload>({
    resolver: zodResolver(createKeyPayloadSchema),
    defaultValues: { name: "" },
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateKeyPayload) =>
      pat.create({
        project_id: projectId,
        name: payload.name?.trim() || undefined,
      }),
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: ["keys", projectId] });
      onCreated(key);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}

export function useRevokeKey(projectId: string, onDone?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pat.revoke,
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: ["keys", projectId] });
      toast.success(`${key.name ?? key.display_hint} revoked`);
      onDone?.();
    },
    onError: (error) => toast.error(error.message),
  });
}
