"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/lib/api-client";
import { signupPayloadSchema, type SignupPayload } from "../types";

export function useSignup() {
  const router = useRouter();

  const form = useForm<SignupPayload>({
    resolver: zodResolver(signupPayloadSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: auth.signup,
    onSuccess: (message, variables) => {
      toast.success(message);
      router.push(`/verify?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
