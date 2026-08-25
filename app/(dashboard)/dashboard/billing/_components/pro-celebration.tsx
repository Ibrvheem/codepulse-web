"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * Shown once, right after a checkout completes. The rarest, happiest moment
 * in the app — the one place the delight budget gets spent generously.
 */
export function ProCelebration({ onDismiss }: { onDismiss: () => void }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, transform: reduceMotion ? "none" : "scale(0.92)" }}
      animate={{ opacity: 1, transform: "scale(1)" }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { type: "spring", duration: 0.6, bounce: 0.3 }
      }
      className="border rounded-lg bg-card p-6 text-center space-y-3"
    >
      <Image
        src="/loggy/loggy-celebrate.png"
        alt="Loggy the mascot jumping for joy in a crown and a PRO badge"
        width={121}
        height={160}
        className="mx-auto"
        priority
      />
      <p className="text-lg font-semibold tracking-tight">Welcome to Pro</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Unlimited projects, your full history, both voices, and Copy as standup
        are all yours. Loggy is thrilled.
      </p>
      <div className="pt-1 flex justify-center">
        <Button size="sm" onClick={onDismiss}>
          Let&apos;s go
        </Button>
      </div>
    </motion.div>
  );
}
