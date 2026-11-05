"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaggerItem, StaggerReveal } from "@/components/motion/stagger-reveal";

type Stage = "connect" | "channels";

const STEPS = [
  {
    title: "Connect Buffer",
    body: "Approve WriteLogs in Buffer. We only read your channels and create posts.",
  },
  {
    title: "Add a channel",
    body: "X, LinkedIn, Threads, Bluesky or Mastodon. Buffer's free plan allows three.",
  },
  {
    title: "Post any day",
    body: "Open a day or a recap, press Post this day, fix a word, send.",
  },
];

const COPY: Record<
  Stage,
  { image: string; alt: string; title: string; body: string }
> = {
  connect: {
    image: "/loggy/loggy-connect.png",
    alt: "Loggy plugging a cable into a socket",
    title: "You shipped today. Now say so.",
    body: "Your work log already knows what you built. Link Buffer and Loggy turns any day into a post for each of your channels.",
  },
  channels: {
    image: "/loggy/loggy-megaphone.png",
    alt: "Loggy holding a megaphone with no one to tell yet",
    title: "Loggy has a megaphone, but nowhere to shout.",
    body: "Buffer is connected, but it has no social accounts yet. Add one in Buffer and it shows up here.",
  },
};

/** A made-up post, so people see what they get before they connect anything. */
function SamplePost() {
  const text =
    "Fixed the login loop that kept signing people out after an hour. Billing now retries failed cards before emailing anyone.";
  return (
    <div className="w-full rounded-md border bg-background px-3 py-2 text-left">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">X</span> · draft from
          Tuesday
        </span>
        <span className="tabular-nums">{text.length} / 280</span>
      </div>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export function BufferOnboarding({
  stage,
  onConnect,
  connecting,
  onRecheck,
  rechecking,
}: {
  stage: Stage;
  onConnect?: () => void;
  connecting?: boolean;
  onRecheck?: () => void;
  rechecking?: boolean;
}) {
  const copy = COPY[stage];
  const current = stage === "connect" ? 0 : 1;

  return (
    <StaggerReveal className="border rounded-lg bg-card p-5 sm:p-6 space-y-5">
      <StaggerItem className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Image
          src={copy.image}
          alt={copy.alt}
          width={300}
          height={stage === "connect" ? 227 : 300}
          sizes="96px"
          priority
          className="h-auto w-24 shrink-0"
        />
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">
            {copy.title}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">{copy.body}</p>
        </div>
      </StaggerItem>

      {stage === "connect" && (
        <StaggerItem>
          <SamplePost />
        </StaggerItem>
      )}

      <ol className="grid gap-2 sm:grid-cols-3">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <StaggerItem
              key={step.title}
              as="li"
              className={`rounded-md border px-3 py-2 space-y-1 ${
                active ? "border-foreground/40 bg-muted/40" : ""
              } ${!done && !active ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums ${
                    done
                      ? "border-foreground bg-foreground text-background"
                      : active
                        ? "border-foreground"
                        : ""
                  }`}
                >
                  {done ? <Check className="size-3" /> : i + 1}
                </span>
                <p className="text-sm font-medium">
                  {step.title}
                  {done && <span className="sr-only"> (done)</span>}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </StaggerItem>
          );
        })}
      </ol>

      <StaggerItem className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {stage === "connect" ? (
          <>
            <Button
              size="xs"
              loading={connecting}
              onClick={onConnect}
              className="group self-start px-3.5 has-[>svg]:px-3.5"
            >
              Connect Buffer
              {!connecting && (
                <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              No Buffer account?{" "}
              <a
                href="https://buffer.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create one free
              </a>
            </p>
          </>
        ) : (
          <>
            <Button
              asChild
              size="xs"
              className="group self-start px-3.5 has-[>svg]:px-3.5"
            >
              <a
                href="https://publish.buffer.com/channels/connect"
                target="_blank"
                rel="noreferrer"
              >
                Add channel
                <ArrowUpRight className="size-3.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Button>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              Added one already?
              <Button
                variant="link"
                size="xs"
                onClick={onRecheck}
                disabled={rechecking}
                className="h-auto px-0 text-xs text-foreground"
              >
                <RefreshCw
                  className={`size-3 ${rechecking ? "animate-spin" : ""}`}
                />
                {rechecking ? "Checking" : "Check again"}
              </Button>
            </p>
          </>
        )}
      </StaggerItem>
    </StaggerReveal>
  );
}
