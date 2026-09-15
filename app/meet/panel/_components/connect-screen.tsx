"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";

/**
 * What a first-time visitor sees. Written for someone who found the add-on in
 * the Marketplace and has no idea what WriteLogs is: the picture tells the
 * story (editors in, standup out), the three steps say it in words, and the
 * two links cover both "I have an account" and "I don't".
 */
const EDITORS = ["VS Code", "Cursor", "Windsurf", "Antigravity"];

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Install WriteLogs in your editor",
    body: (
      <>
        {EDITORS.map((name, i) => (
          <span key={name}>
            <span className="font-semibold text-foreground">{name}</span>
            {i < EDITORS.length - 2 ? ", " : i === EDITORS.length - 2 ? " or " : ""}
          </span>
        ))}
        . Takes a minute.
      </>
    ),
  },
  {
    title: "Code like you normally do",
    body: "WriteLogs watches what you build and writes your daily work log for you.",
  },
  {
    title: "Open this panel in standup",
    body: "Your update is already here: what you did, what's next, and blockers. Read it out or copy it.",
  },
];

export function ConnectScreen({ onConnect }: { onConnect: () => void }) {
  return (
    <StaggerReveal className="space-y-5">
      <StaggerItem>
        <Image
          src="/loggy/meet-illustration.png"
          alt="Loggy at a laptop, with VS Code, Cursor, Windsurf and Antigravity feeding into a Google Meet standup card"
          width={1570}
          height={1002}
          sizes="360px"
          priority
          className="mx-auto w-full max-w-[300px]"
        />
      </StaggerItem>

      <StaggerItem className="space-y-1.5 text-center">
        <h1 className="text-lg font-semibold leading-tight">
          Your standup, already written.
        </h1>
        <p className="text-sm text-muted-foreground">
          WriteLogs turns your coding activity into standup notes. Here&apos;s how
          it works.
        </p>
      </StaggerItem>

      <ol className="space-y-3">
        {STEPS.map((step, i) => (
          <StaggerItem key={step.title} as="li" className="flex gap-3">
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center border border-border bg-card text-xs font-semibold tabular-nums"
            >
              {i + 1}
            </span>
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-snug">{step.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </StaggerItem>
        ))}
      </ol>

      <StaggerItem className="space-y-3">
        <Button onClick={onConnect} className="w-full">
          Connect WriteLogs
          <ArrowRight className="size-4" />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          New here?{" "}
          <a
            href="/signup"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Create a free account
          </a>
          , then press Connect.
        </p>
      </StaggerItem>
    </StaggerReveal>
  );
}
