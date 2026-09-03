"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/lib/api-client";
import {
  forgotPasswordPayloadSchema,
  resetPasswordPayloadSchema,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
} from "../types";

const RESEND_COOLDOWN_SECONDS = 60;

export type ForgotPasswordStep = "email" | "otp" | "password";

export function useForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  // Short-lived (5 min) token minted by verify-reset-otp; authorizes the
  // final reset call instead of a session.
  const [resetToken, setResetToken] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Countdown timer — one of the rare legitimate effects.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft > 0]);

  const emailForm = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordPayloadSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordPayloadSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const requestMutation = useMutation({
    mutationFn: auth.forgotPassword,
    onSuccess: (message, variables) => {
      toast.success(message);
      setEmail(variables.email);
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      setStep("otp");
    },
    onError: (error) => toast.error(error.message),
  });

  const verifyMutation = useMutation({
    mutationFn: auth.verifyResetOtp,
    onSuccess: (data) => {
      setResetToken(data.reset_token);
      setStep("password");
    },
    onError: (error) => {
      setOtp("");
      toast.error(error.message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: auth.resetPassword,
    onSuccess: (message) => {
      toast.success(message);
      router.push("/signin");
    },
    onError: (error) => toast.error(error.message),
  });

  const submitEmail = emailForm.handleSubmit((data) =>
    requestMutation.mutate(data),
  );

  const submitOtp = (code: string) => {
    if (verifyMutation.isPending) return;
    verifyMutation.mutate({ email, otp: code });
  };

  const resend = () => {
    if (secondsLeft > 0 || requestMutation.isPending) return;
    requestMutation.mutate({ email });
  };

  const submitPassword = passwordForm.handleSubmit((data) =>
    resetMutation.mutate({
      reset_token: resetToken,
      new_password: data.new_password,
    }),
  );

  return {
    step,
    email,
    otp,
    setOtp,
    secondsLeft,
    emailForm,
    passwordForm,
    submitEmail,
    submitOtp,
    submitPassword,
    resend,
    isRequesting: requestMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isResetting: resetMutation.isPending,
  };
}
