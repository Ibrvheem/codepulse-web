"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/animate-ui/components/radix/dialog";

export function WaitListSuccessDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>
            <motion.div
              initial={{ scale: 0.7, opacity: 0.7 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex justify-center mb-2"
            >
              <CheckCircle2Icon className="text-green-500 w-12 h-12" />
            </motion.div>
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
              className="max-w-sm text-sm text-neutral-600 dark:text-neutral-300 text-center mx-auto "
            >
              Thank you for signing up. We&apos;ll keep you updated with early
              access and product news. No spam, ever.
            </motion.p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
