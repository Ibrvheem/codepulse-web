"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { MEET_ADDON_URL } from "@/lib/meet-addon";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "writelogs.meet-promo-dismissed";

/**
 * Promotes the Meet add-on on the page people actually open every day.
 *
 * Hidden until the effect confirms it wasn't dismissed: rendering it on the
 * server and pulling it away a tick later is worse than arriving a tick late.
 */
export function MeetPromo() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(window.localStorage.getItem(DISMISSED_KEY) !== "1");
    } catch {
      setShow(true); // storage blocked, showing it is the safe default
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // it'll come back next visit, which is a fine failure mode
    }
  };

  if (!show) return null;

  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={dismiss}
        className="absolute right-2 top-2 z-10 size-7 text-muted-foreground"
      >
        <X className="size-4" />
        <span className="sr-only">Dismiss</span>
      </Button>

      <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_auto]">
        <div className="max-w-md">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            New
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">
            Your log, waiting in your standup
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Add WriteLogs to Google Meet and yesterday&apos;s summary opens in
            the side panel when the call starts. Switch projects and copy a
            standup-ready version without leaving the meeting.
          </p>
          <a
            href={MEET_ADDON_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ size: "sm" }), "mt-5")}
          >
            Add to Meet
          </a>
        </div>

        <Image
          src="/meet-panel.jpg"
          alt="The WriteLogs side panel open during a meeting"
          width={2400}
          height={1559}
          className="hidden h-auto w-[280px] rounded-md sm:block"
        />
      </div>
    </div>
  );
}
