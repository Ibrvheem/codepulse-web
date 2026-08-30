"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, pat } from "@/lib/api-client";
import type { CreatedPatKey } from "@/lib/types";
import { createKeyPayloadSchema, type CreateKeyPayload } from "../types";

export function useCreateKey(
  projectId: string,
  onCreated: (key: CreatedPatKey) => void,
) {
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
    // Deliberately NO list invalidation here: a refetch can flip the empty
    // state and unmount the dialog that owns the one-time token. The dialog
    // invalidates when it closes instead.
    onSuccess: (key) => onCreated(key),
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}

export function useRegenerateKey(
  onCreated: (key: CreatedPatKey) => void,
) {
  return useMutation({
    mutationFn: pat.regenerate,
    // No list invalidation here — the token dialog owns the one-time secret;
    // the caller invalidates when that dialog closes (same as create).
    onSuccess: (key) => onCreated(key),
    onError: (error) => toast.error(error.message),
  });
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
    onError: (error) => {
      // Already revoked/gone — same outcome as success.
      if (error instanceof ApiError && error.status === 404) {
        queryClient.invalidateQueries({ queryKey: ["keys", projectId] });
        onDone?.();
        return;
      }
      toast.error(error.message);
    },
  });
}
