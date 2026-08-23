"use client";

import Link from "next/link";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import { FadeIn } from "@/components/motion/fade-in";
import { useSignin } from "../_hooks/use-signin";

export function SigninForm() {
  const { form, onSubmit, isPending } = useSignin();

  return (
    <FadeIn>
      <div className="space-y-1.5 mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to see what you shipped.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
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
            placeholder="Your password"
            showEyeIcon
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" loading={isPending}>
            Sign in
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-sm text-muted-foreground">
        New to WriteLogs?{" "}
        <Link
          href="/signup"
          className="text-foreground underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </FadeIn>
  );
}
