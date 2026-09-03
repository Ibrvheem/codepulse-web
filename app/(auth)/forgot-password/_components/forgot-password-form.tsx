"use client";

import Link from "next/link";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { FadeIn } from "@/components/motion/fade-in";
import { useForgotPassword } from "../_hooks/use-forgot-password";

export function ForgotPasswordForm() {
  const {
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
    isRequesting,
    isVerifying,
    isResetting,
  } = useForgotPassword();

  if (step === "otp") {
    return (
      <FadeIn key="otp">
        <div className="space-y-1.5 mb-8">
          <h1 className="text-xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit reset code to{" "}
            <span className="text-foreground font-medium">{email}</span>.
          </p>
        </div>

        <div data-mask>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          onComplete={submitOtp}
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
          onClick={() => submitOtp(otp)}
        >
          Continue
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
              loading={isRequesting}
              onClick={resend}
            >
              Resend code
            </Button>
          )}
        </div>
      </FadeIn>
    );
  }

  if (step === "password") {
    return (
      <FadeIn key="password">
        <div className="space-y-1.5 mb-8">
          <h1 className="text-xl font-semibold tracking-tight">
            Set a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Almost done — pick a new password for{" "}
            <span className="text-foreground font-medium">{email}</span>.
          </p>
        </div>
        <Form {...passwordForm}>
          <form onSubmit={submitPassword} className="space-y-4">
            <ControlledInput
              name="new_password"
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              showEyeIcon
              autoComplete="new-password"
            />
            <ControlledInput
              name="confirm_password"
              label="Confirm password"
              type="password"
              placeholder="Repeat it"
              showEyeIcon
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full" loading={isResetting}>
              Reset password
            </Button>
          </form>
        </Form>
      </FadeIn>
    );
  }

  return (
    <FadeIn key="email">
      <div className="space-y-1.5 mb-8">
        <h1 className="text-xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>
      <Form {...emailForm}>
        <form onSubmit={submitEmail} className="space-y-4">
          <ControlledInput
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Button type="submit" className="w-full" loading={isRequesting}>
            Send reset code
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/signin"
          className="text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </FadeIn>
  );
}
