"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buffer } from "@/lib/api-client";
import type { BufferStatus, BufferTone } from "@/lib/types";

export const BUFFER_KEY = ["buffer"];

/** The user's Buffer link, channels and settings. */
export function useBufferStatus(enabled = true) {
  return useQuery({
    queryKey: BUFFER_KEY,
    queryFn: buffer.status,
    staleTime: 60_000,
    enabled,
  });
}

/** Asks the API where to go, then sends the browser there. */
export function useConnectBuffer() {
  return useMutation({
    mutationFn: (returnTo?: string) => buffer.connectUrl(returnTo),
    onSuccess: (url) => {
      window.location.assign(url);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateBufferSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      channel_ids?: string[];
      tone?: BufferTone;
      auto_draft?: boolean;
    }) => buffer.updateSettings(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: BUFFER_KEY });
      const previous = queryClient.getQueryData<BufferStatus>(BUFFER_KEY);
      queryClient.setQueryData<BufferStatus>(BUFFER_KEY, (old) =>
        old ? { ...old, ...payload } : old,
      );
      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(BUFFER_KEY, context.previous);
      }
      toast.error(error.message);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<BufferStatus>(BUFFER_KEY, (old) =>
        old ? { ...old, ...updated } : updated,
      );
    },
  });
}

export function useDisconnectBuffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: buffer.disconnect,
    onSuccess: () => {
      queryClient.setQueryData<BufferStatus>(BUFFER_KEY, {
        connected: false,
        configured: true,
      });
      toast.success("Buffer disconnected.");
    },
    onError: (error) => toast.error(error.message),
  });
}
