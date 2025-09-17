"use client";
import React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";

export function WaitListForm() {
  const form = useForm({});
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
    // TODO: Connect this to your backend or waitlist API
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Get on the WriteLogs List
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        WriteLogs quietly watches your coding rhythm and turns it into simple,
        human-friendly summaries. No timers, no fiddly forms. Sign up as a solo
        engineer or on behalf of your organisation and we’ll save you a spot in
        the early release.
      </p>

      <Form {...form}>
        <div className="space-y-4 my-6">
          <ControlledInput
            name="name"
            label="Name"
            placeholder="John Doe"
            className="bg-zinc-100"
          />
          <ControlledInput
            name="email"
            label="Email"
            placeholder="johndoe@email.com"
            className="bg-zinc-100"
          />
          <ControlledSelect
            name="accountType"
            label="Signing up as"
            className="bg-zinc-100 w-full py-5 border-0"
            placeholder="Organisation or solo engineer"
            values={[
              { value: "solo", name: "Solo engineer" },
              { value: "org", name: "Organization" },
            ]}
          />
        </div>

        <Button
          className="w-full h-10 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-800 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
        >
          Save my spot &rarr;
          <BottomGradient />
        </Button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          We only use your email to share waitlist updates and occasional
          product news — no spam, ever.
        </p>
      </Form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
