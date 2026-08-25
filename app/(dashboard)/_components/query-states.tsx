"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/components/motion/stagger-reveal";

export function ErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="border border-destructive/30 bg-destructive/5 rounded-lg p-6 text-center space-y-3"
    >
      <Image
        src="/loggy/loggy-error.png"
        alt="Loggy the mascot scratching his head over a crumpled log sheet"
        width={93}
        height={120}
        className="mx-auto"
      />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} loading={retrying}>
          Try again
        </Button>
      )}
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      // Empty states are rare, first-run moments — the one place a little
      // bounce is earned.
      initial={{ opacity: 0, transform: reduceMotion ? "none" : "scale(0.95)" }}
      animate={{ opacity: 1, transform: "scale(1)" }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { type: "spring", duration: 0.5, bounce: 0.2 }
      }
      className="border border-dashed rounded-lg p-10 text-center space-y-3"
    >
      <Image
        src="/loggy/loggy-empty.png"
        alt="Loggy the mascot waiting patiently with a pencil and a blank page"
        width={105}
        height={140}
        className="mx-auto"
      />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      {children && <div className="pt-2 flex justify-center">{children}</div>}
    </motion.div>
  );
}
