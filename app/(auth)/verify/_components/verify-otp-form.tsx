"use client";

import Image from "next/image";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { useVerifyOtp } from "../_hooks/use-verify-otp";

export function VerifyOtpForm({
  email,
  autoResend,
}: {
  email: string;
  autoResend: boolean;
}) {
  const {
    otp,
    setOtp,
    submit,
    resend,
    secondsLeft,
    isVerifying,
    isResending,
  } = useVerifyOtp(email, autoResend);

  return (
    <FadeIn>
      <div className="mb-6">
        <Image
          src="/loggy/loggy-verify.png"
          alt="Loggy the mascot pulling a verified envelope out of a mailbox"
          width={162}
          height={110}
          priority
        />
      </div>
      <div className="space-y-1.5 mb-8">
        <h1 className="text-xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="text-foreground font-medium">{email}</span>. Enter it
          below to verify your account.
        </p>
      </div>

      <div data-mask>
      <InputOTP
        maxLength={6}
        value={otp}
        onChange={setOtp}
        onComplete={submit}
        disabled={isVerifying}
        autoFocus
      >
        <InputOTPGroup className="w-full justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className="h-12 w-12 text-lg rounded-md border"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      </div>

      <Button
        className="w-full mt-6"
        loading={isVerifying}
        disabled={otp.length !== 6}
        onClick={() => submit(otp)}
      >
        Verify email
      </Button>

      <div className="mt-6 text-sm text-muted-foreground">
        Didn&apos;t get it?{" "}
        {secondsLeft > 0 ? (
          <span className="tabular-nums">
            You can resend in {secondsLeft}s
          </span>
        ) : (
          <Button
            variant="link"
            className="p-0 h-auto text-sm"
            loading={isResending}
            onClick={resend}
          >
            Resend code
          </Button>
        )}
      </div>
    </FadeIn>
  );
}
