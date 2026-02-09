"use client";

import React, { Suspense, useState } from "react";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import { CheckCircle2Icon } from "lucide-react";

const waitlistPayload = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  accountType: z.enum(["solo", "org"]),
});

type WaitlistPayload = z.infer<typeof waitlistPayload>;

async function joinWaitlist(data: WaitlistPayload) {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export function WaitlistDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<WaitlistPayload>({
    resolver: zodResolver(waitlistPayload),
    defaultValues: {
      name: "",
      email: "",
      accountType: undefined,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await joinWaitlist(data);
      if (response.ok) {
        toast.success(response.message);
        setIsSuccess(true);
        reset();
      } else {
        toast.error(response.error);
        form.setError("root", { type: "manual", message: response.error });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <SuccessContent />
        ) : (
          <FormContent
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessContent() {
  return (
    <DialogHeader className="items-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0.7 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex justify-center mb-2"
      >
        <CheckCircle2Icon className="text-green-500 w-12 h-12" />
      </motion.div>
      <DialogTitle>
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="block text-xl font-bold text-neutral-800 dark:text-neutral-200 text-center"
        >
          You&apos;re on the Waitlist!
        </motion.span>
      </DialogTitle>
      <DialogDescription>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-sm text-sm text-neutral-600 dark:text-neutral-300 text-center mx-auto"
        >
          Thank you for signing up. We&apos;ll keep you updated with early
          access and product news. No spam, ever.
        </motion.p>
      </DialogDescription>
    </DialogHeader>
  );
}

function FormContent({
  form,
  onSubmit,
  isSubmitting,
}: {
  form: ReturnType<typeof useForm<WaitlistPayload>>;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Suspense>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Get on the WriteLogs List
        </DialogTitle>
        {/* <DialogDescription className="text-sm text-neutral-600 dark:text-neutral-300">
          WriteLogs quietly watches your coding rhythm and turns it into simple,
          human-friendly summaries. No timers, no fiddly forms.
        </DialogDescription> */}
      </DialogHeader>

      <Form {...form}>
        <div className="space-y-4 my-4">
          <ControlledInput
            name="name"
            label="Name"
            placeholder="John Doe"
            className="bg-zinc-100 dark:bg-zinc-800"
          />
          <ControlledInput
            name="email"
            label="Email"
            placeholder="johndoe@email.com"
            className="bg-zinc-100 dark:bg-zinc-800"
          />
          <ControlledSelect
            name="accountType"
            label="Signing up as"
            className="bg-zinc-100 dark:bg-zinc-800 w-full py-5 border-0"
            placeholder="Organisation or solo engineer"
            values={[
              { value: "solo", name: "Solo engineer" },
              { value: "org", name: "Organization" },
            ]}
          />
        </div>

        <motion.button
          onClick={() => onSubmit()}
          className="relative w-full h-10 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-800 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] flex items-center justify-center gap-2"
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
          <span>{isSubmitting ? "Saving..." : "Save my spot →"}</span>
        </motion.button>

        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 text-center">
          We only use your email to share waitlist updates and occasional
          product news — no spam, ever.
        </p>
      </Form>
    </Suspense>
  );
}
