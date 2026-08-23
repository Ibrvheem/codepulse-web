"use client";

import Link from "next/link";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import { FadeIn } from "@/components/motion/fade-in";
import { useSignup } from "../_hooks/use-signup";

export function SignupForm() {
  const { form, onSubmit, isPending } = useSignup();

  return (
    <FadeIn>
      <div className="space-y-1.5 mb-8">
        <h1 className="text-xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Your coding activity, summarized daily. Free while in beta.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <ControlledInput
            name="full_name"
            label="Full name"
            placeholder="Ada Lovelace"
            autoComplete="name"
          />
          <ControlledInput
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          <ControlledInput
            name="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            showEyeIcon
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" loading={isPending}>
            Create account
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </FadeIn>
  );
}
