"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { feedback } from "@/lib/api-client";
import {
  createFeedbackPayloadSchema,
  type CreateFeedbackPayload,
} from "../types";

export function useCreateFeedback() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateFeedbackPayload>({
    resolver: zodResolver(createFeedbackPayloadSchema),
    defaultValues: { title: "", category: "FEATURE", body: "" },
  });

  const mutation = useMutation({
    mutationFn: feedback.create,
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast.success("Posted — thanks!");
      router.push(`/dashboard/feedback/${post.id}`);
    },
    // 429 (20 posts/hour) arrives here with the API's own message.
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
