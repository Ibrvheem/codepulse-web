"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { creators } from "@/lib/api-client";
import { discoverPayloadSchema, type DiscoverPayload } from "../types";

export function useDiscover(defaultProvider: string) {
  const queryClient = useQueryClient();

  const form = useForm<DiscoverPayload>({
    resolver: zodResolver(discoverPayloadSchema),
    defaultValues: { provider: defaultProvider, query: "" },
  });

  const mutation = useMutation({
    mutationFn: creators.discover,
    onSuccess: ({ found, added }) => {
      queryClient.invalidateQueries({ queryKey: ["creators"] });
      if (found === 0) toast.info("Nobody matched that search.");
      else if (added === 0) toast.info(`Found ${found}, all already here.`);
      else toast.success(`Added ${added} of ${found} found. Scoring them now.`);
    },
    // A source's rate limit arrives here with a message saying to wait.
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
