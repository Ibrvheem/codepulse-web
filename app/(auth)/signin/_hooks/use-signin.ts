"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth, ApiError } from "@/lib/api-client";
import { signinPayloadSchema, type SigninPayload } from "../types";

export function useSignin() {
  const router = useRouter();

  const form = useForm<SigninPayload>({
    resolver: zodResolver(signinPayloadSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: auth.signin,
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error, variables) => {
      // 403 = account exists but email is unverified — take them to the OTP
      // screen and trigger a fresh code.
      if (error instanceof ApiError && error.status === 403) {
        toast.info(error.message);
        router.push(
          `/verify?email=${encodeURIComponent(variables.email)}&resend=1`,
        );
        return;
      }
      toast.error(error.message);
    },
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isPending: mutation.isPending };
}
