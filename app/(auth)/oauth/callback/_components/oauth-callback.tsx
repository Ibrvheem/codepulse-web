"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/api-client";

/** Thin indeterminate bar — a spinner says "stuck", a bar says "moving". */
function ProgressBar() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <div className="h-0.5 w-full rounded-full bg-muted" />;
  }
  return (
    <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full w-1/3 rounded-full bg-foreground/70"
        animate={{ x: ["-110%", "330%"] }}
        transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
}

/**
 * Landing spot after the provider redirect. Trades the single-use code from
 * the API for a session, then hands off to the dashboard.
 */
export function OauthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  // The code is single use, so React's double-invoked effects in development
  // would burn it on the first run and fail on the second.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = searchParams.get("code");
    const returnTo = searchParams.get("return_to");
    if (!code) {
      setError("That sign-in link was incomplete. Start again from sign in.");
      return;
    }

    auth
      .oauthExchange(code)
      .then(() => {
        const safe =
          returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
            ? returnTo
            : "/dashboard";
        router.replace(safe);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error && err.message
            ? err.message
            : "We couldn't finish signing you in.",
        );
      });
  }, [router, searchParams]);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="text-center"
      >
        <div className="mb-7 flex justify-center">
          <Image
            src="/loggy/loggy-error.png"
            alt="Loggy the mascot scratching his head"
            width={124}
            height={160}
            priority
          />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          That didn&apos;t go through.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <div className="mt-7">
          <Link href="/signin">
            <Button className="w-full">Back to sign in</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-7 flex justify-center">
        <motion.div
          // A slow bob, so the wait reads as Loggy working rather than a
          // frozen screen. Held still for reduced motion.
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
        >
          <Image
            src="/loggy/loggy-verify.png"
            alt=""
            width={162}
            height={110}
            priority
          />
        </motion.div>
      </div>
      <h1 className="text-xl font-semibold tracking-tight">Signing you in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Setting up your session. This takes a second.
      </p>
      <div className="mt-8 px-6">
        <ProgressBar />
      </div>
    </div>
  );
}
