"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createHandoffSession, isAuthenticated } from "@/lib/api-client";

export const HANDOFF_MESSAGE = "writelogs:meet-session";

/**
 * Popup target for the Meet add-on's "Connect" button.
 *
 * This window is top level, so it sees the normal dashboard session. The panel
 * that opened it is an iframe inside meet.google.com with partitioned storage
 * and cannot. So we read the session here and post it back to the opener,
 * strictly same-origin.
 */
export function MeetConnect() {
  const [state, setState] = useState<"working" | "signed-out" | "done">(
    "working",
  );
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    if (!isAuthenticated()) {
      setState("signed-out");
      return;
    }

    createHandoffSession()
      .then((session) => {
        if (!session) {
          setState("signed-out");
          return;
        }
        // targetOrigin is our own origin, so the payload never reaches Meet.
        window.opener?.postMessage(
          { type: HANDOFF_MESSAGE, ...session },
          window.location.origin,
        );
        setState("done");
        setTimeout(() => window.close(), 900);
      })
      // The only likely failure is a dead session, which signing in fixes.
      .catch(() => setState("signed-out"));
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <Image
        src={state === "signed-out" ? "/loggy/meet-illustration.png" : "/loggy/loggy-head.png"}
        alt=""
        width={state === "signed-out" ? 1570 : 44}
        height={state === "signed-out" ? 1002 : 45}
        sizes="320px"
        priority
        className={state === "signed-out" ? "w-full max-w-[280px]" : undefined}
      />
      {state === "working" ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Connecting…
        </p>
      ) : null}

      {state === "done" ? (
        <div className="space-y-1">
          <p className="font-medium">Connected.</p>
          <p className="text-sm text-muted-foreground">
            You can close this window.
          </p>
        </div>
      ) : null}

      {state === "signed-out" ? (
        <div className="max-w-xs space-y-4">
          <p className="text-lg font-semibold leading-tight">
            Your standup, already written.
          </p>
          <p className="text-sm text-muted-foreground">
            WriteLogs watches what you build in VS Code, Cursor, Windsurf or
            Antigravity and writes your daily work log. Sign in and this
            window connects your account to Meet.
          </p>
          <a
            href="/signin?return_to=/meet/connect"
            className={cn(buttonVariants(), "w-full")}
          >
            Sign in
          </a>
          <p className="text-sm text-muted-foreground">
            New to WriteLogs?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Create a free account
            </a>
            , then come back and press Connect.
          </p>
        </div>
      ) : null}
    </div>
  );
}
