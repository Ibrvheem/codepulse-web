"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/components/motion/stagger-reveal";
import { auth, SESSION_EXPIRED_MESSAGE } from "@/lib/api-client";
import { BILLING_PATH } from "../_hooks/use-upgrade-toast";

/** Retrying a dead session just fails again — offer the only real fix. */
function SignOutButton() {
  const router = useRouter();
  const signOut = useMutation({
    mutationFn: auth.logout,
    onSettled: () => router.replace("/signin"),
  });
  return (
    <Button
      variant="outline"
      size="sm"
      loading={signOut.isPending}
      onClick={() => signOut.mutate()}
    >
      Sign out
    </Button>
  );
}

/** A 402 rendered in place: the API's own message plus the way forward. */
export function UpgradeState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="border border-dashed rounded-lg p-8 text-center space-y-3"
    >
      <Image
        src="/loggy/loggy-lock.png"
        alt="Loggy the mascot peeking over a padlock"
        width={102}
        height={140}
        className="mx-auto"
      />
      <p className="text-sm max-w-sm mx-auto">{message}</p>
      <div className="pt-1 flex justify-center">
        <Link href={BILLING_PATH}>
          <Button size="sm">Upgrade to Pro</Button>
        </Link>
      </div>
    </motion.div>
  );
}

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
      {message === SESSION_EXPIRED_MESSAGE ? (
        <SignOutButton />
      ) : (
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} loading={retrying}>
            Try again
          </Button>
        )
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
