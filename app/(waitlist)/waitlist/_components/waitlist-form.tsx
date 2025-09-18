"use client";
import React, { Suspense } from "react";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";
import { motion } from "framer-motion";
import { useJoinWaitlist } from "../_hooks/useJoinWaitlist";
import { Loader2 } from "lucide-react";
import { WaitListSuccessDialog } from "./waitlist-success-dialog";

export function WaitListForm() {
  const { form, onSubmit, isSubmitSuccessful, isSubmitting, open, setOpen } =
    useJoinWaitlist();

  return (
    <Suspense>
      <>
        <motion.div
          className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h2
            className="text-xl font-bold text-neutral-800 dark:text-neutral-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Get on the WriteLogs List
          </motion.h2>
          <motion.p
            className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            WriteLogs quietly watches your coding rhythm and turns it into
            simple, human-friendly summaries. No timers, no fiddly forms. Sign
            up as a solo engineer or on behalf of your organisation and we’ll
            save you a spot in the early release.
          </motion.p>

          <Form {...form}>
            <motion.div
              className="space-y-4 my-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.22, delayChildren: 0.8 },
                },
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ControlledInput
                  name="name"
                  label="Name"
                  placeholder="John Doe"
                  className="bg-zinc-100"
                />
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ControlledInput
                  name="email"
                  label="Email"
                  placeholder="johndoe@email.com"
                  className="bg-zinc-100"
                />
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
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
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              <motion.button
                onClick={() => onSubmit()}
                className="relative w-full h-10 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-800 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] flex items-center justify-center gap-2"
                type="submit"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                <motion.span
                  initial={false}
                  animate={
                    isSubmitting
                      ? "loading"
                      : isSubmitSuccessful
                      ? "success"
                      : "idle"
                  }
                  variants={{
                    idle: { opacity: 0, scale: 0.8, x: -10 },
                    loading: { opacity: 1, scale: 1, x: 0 },
                    success: { opacity: 1, scale: 1, x: 0 },
                    fail: { opacity: 1, scale: 1, x: 0 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex items-center"
                >
                  {isSubmitting && (
                    <motion.span
                      key="loader"
                      initial={{ rotate: 0, borderRadius: "0%" }}
                      animate={{ rotate: 360, borderRadius: "50%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                        borderRadius: { duration: 0.4, ease: "easeInOut" },
                      }}
                      className=""
                    >
                      <Loader2 className="animate-spin duration-150" />
                    </motion.span>
                  )}
                </motion.span>
                <span>
                  {isSubmitting ? "Saving..." : "Save my spot →"}
                  <BottomGradient />
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            />

            <motion.p
              className="text-xs text-neutral-500 dark:text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.4 }}
            >
              We only use your email to share waitlist updates and occasional
              product news — no spam, ever.
            </motion.p>
          </Form>
        </motion.div>
        <WaitListSuccessDialog open={open} onOpenChange={setOpen} />
      </>
    </Suspense>
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
