"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { creators } from "@/lib/api-client";
import {
  addCreatorPayloadSchema,
  CREATORS_PATH,
  type AddCreatorPayload,
} from "../types";

export function useAddCreator() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<AddCreatorPayload>({
    resolver: zodResolver(addCreatorPayloadSchema),
    defaultValues: {
      platform: "x",
      username: "",
      profile_url: "",
      name: "",
      followers: "",
      bio: "",
      posts: "",
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: AddCreatorPayload) =>
      creators.create({
        platform: data.platform,
        username: data.username,
        profile_url: data.profile_url,
        name: data.name || undefined,
        followers: data.followers === "" ? undefined : data.followers,
        bio: data.bio || undefined,
        posts: data.posts || undefined,
        email: data.email || undefined,
      }),
    onSuccess: (creator) => {
      queryClient.invalidateQueries({ queryKey: ["creators"] });
      toast.success("Added. Scoring them now.");
      router.push(`${CREATORS_PATH}/${creator.id}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
