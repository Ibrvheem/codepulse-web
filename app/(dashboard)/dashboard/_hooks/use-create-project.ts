"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { projects } from "@/lib/api-client";
import {
  createProjectPayloadSchema,
  type CreateProjectPayload,
} from "../types";

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function useCreateProject() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateProjectPayload>({
    resolver: zodResolver(createProjectPayloadSchema),
    defaultValues: { name: "", timezone: browserTimezone() },
  });

  const mutation = useMutation({
    mutationFn: projects.create,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`${project.name} created`);
      router.push(`/dashboard/${project.id}?tab=keys`);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
