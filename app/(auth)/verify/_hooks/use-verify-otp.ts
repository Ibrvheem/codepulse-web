"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/lib/api-client";

const RESEND_COOLDOWN_SECONDS = 60;

export function useVerifyOtp(email: string, autoResend: boolean) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  // Countdown timer — one of the rare legitimate effects.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft > 0]);  

  const verifyMutation = useMutation({
    mutationFn: auth.verifyOtp,
    onSuccess: (data) => {
      if (data?.access_token) {
        toast.success("You're in — email verified.");
        router.push("/dashboard");
      } else {
        toast.success("Email verified. Sign in to continue.");
        router.push("/signin");
      }
    },
    onError: (error) => {
      setOtp("");
      toast.error(error.message);
    },
  });

  const resendMutation = useMutation({
    mutationFn: auth.resendOtp,
    onSuccess: (message) => {
      toast.success(message);
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    },
    onError: (error) => toast.error(error.message),
  });

  // Arriving from a 403 signin means no fresh code exists yet — send one.
  const autoResendFired = useRef(false);
  useEffect(() => {
    if (autoResend && !autoResendFired.current) {
      autoResendFired.current = true;
      resendMutation.mutate({ email });
    }
  }, [autoResend, email]);  

  const submit = (code: string) => {
    if (verifyMutation.isPending) return;
    verifyMutation.mutate({ email, otp: code });
  };

  const resend = () => {
    if (secondsLeft > 0 || resendMutation.isPending) return;
    resendMutation.mutate({ email });
  };

  return {
    otp,
    setOtp,
    submit,
    resend,
    secondsLeft,
    isVerifying: verifyMutation.isPending,
    isResending: resendMutation.isPending,
  };
}
