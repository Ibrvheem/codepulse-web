"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form } from "@/components/ui/form";
import { useSignUpForm } from "../_hooks/useSignUpForm";
import ControlledInput from "@/components/molecules/controlled-input";
import { Command, Loader2 } from "lucide-react";
import Link from "next/link";

export function SignUpForm() {
  const { form, onSubmit, isSubmitting } = useSignUpForm();
  return (
    <Form {...form}>
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        <div className="flex items-center gap-2 my-4 text-base">
          <Command className="h-10 w-10 bg-indigo-600 text-white p-2 rounded-md" />{" "}
          <p className="font-medium">WriteLogs</p>
        </div>
        <div className="my-8">
          <ControlledInput
            name="email"
            label="Email"
            placeholder="johndoe@writelogs.com"
          />
          <ControlledInput
            name="password"
            label="Password"
            placeholder="••••••••"
            type="password"
          />

          <motion.button
            className="group/btn mt-4 relative block h-10 w-full rounded-md bg-gradient-to-br from-indigo-900 to-indigo-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            onClick={() => onSubmit()}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isSubmitting ? "loading" : "idle"}
            variants={{
              idle: {
                background:
                  "linear-gradient(to bottom right, #312e81, #4f46e5)",
              },
              loading: {
                background:
                  "linear-gradient(to bottom right, #4f46e5, #6366f1)",
              },
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-center gap-2">
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <motion.span
                animate={{ x: isSubmitting ? -8 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {isSubmitting ? "Creating Account..." : "Sign Up →"}
              </motion.span>
            </div>
            <BottomGradient />
          </motion.button>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Form>
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
