"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  EASE_OUT,
  StaggerItem,
  StaggerReveal,
} from "@/components/motion/stagger-reveal";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import { track } from "@/lib/analytics";
import type { GitStandup } from "@/lib/types";

import { useGitStandup } from "../_hooks/use-git-standup";
import { GIT_COMMAND, MAX_LOG_CHARS, TOOL_ID } from "../types";

function CopyButton({
  text,
  label = "Copy",
  onCopy,
}: {
  text: string;
  label?: string;
  onCopy?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the text is still on screen to select.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function standupText(result: GitStandup): string {
  return [result.message, "", ...result.tasks.map((t) => `- ${t.task}`)].join(
    "\n",
  );
}

function CommitNote({ result }: { result: GitStandup }) {
  const n = result.commits;
  const commits = `${n} ${n === 1 ? "commit" : "commits"}`;
  if (result.messages_only) {
    return (
      <>
        {commits}, no file names. Add{" "}
        <code className="text-neutral-700">--stat</code> to the command and the
        summary gets a lot more specific.
      </>
    );
  }
  if (result.vague_commits > 0) {
    const v = result.vague_commits;
    return (
      <>
        {commits}. {v} of them said &ldquo;{result.vague_example ?? "wip"}
        &rdquo; or similar, so {v === 1 ? "that one was" : "those were"} worked
        out from the file names.
      </>
    );
  }
  return (
    <>
      {commits}, {result.files} files. Good commit messages, by the way.
    </>
  );
}

/** Bullets under their area, in the order the areas first appear. */
function groupByArea(tasks: GitStandup["tasks"]) {
  const groups = new Map<string, GitStandup["tasks"]>();
  for (const task of tasks) {
    const area = task.area.trim();
    groups.set(area, [...(groups.get(area) ?? []), task]);
  }
  return [...groups.entries()];
}

function ResultCard({ result }: { result: GitStandup }) {
  const groups = groupByArea(result.tasks);
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/60">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-100 bg-neutral-50 px-6 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
          Your standup
        </p>
        <CopyButton
          text={standupText(result)}
          label="Copy for Slack"
          onCopy={() => track("git_standup_copied")}
        />
      </div>
      <div className="p-6 sm:p-8">
        <StaggerReveal>
          <StaggerItem>
            <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] text-neutral-900 sm:text-3xl">
              {result.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              {result.message}
            </p>
          </StaggerItem>
          <div className="mt-8 space-y-6">
            {groups.map(([area, tasks]) => (
              <StaggerItem key={area || "other"}>
                {area ? (
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    {area}
                  </p>
                ) : null}
                <ul className="space-y-2.5">
                  {tasks.map((t) => (
                    <li key={t.task} className="flex gap-3">
                      <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-neutral-900" />
                      <div className="min-w-0">
                        <p className="font-medium leading-relaxed text-neutral-900">
                          {t.task}
                        </p>
                        {t.files.length > 0 ? (
                          <p className="mt-0.5 truncate font-mono text-[11px] text-neutral-400">
                            {t.files.slice(0, 3).join("  ")}
                            {t.files.length > 3
                              ? `  +${t.files.length - 3}`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </div>
        </StaggerReveal>
        <p className="mt-8 border-t border-neutral-100 pt-4 text-xs text-neutral-400">
          <CommitNote result={result} />
        </p>
      </div>
    </div>
  );
}

/** Three plain things, each one readable in a second. No time angle yet. */
const value = (word: string) => [
  "No command. No paste.",
  `Knows what \u201c${word}\u201d actually was.`,
  "Ready in Google Meet before standup.",
];

/**
 * The sell. Two lines the brain gets at a glance: this update came from
 * commit messages only, and WriteLogs writes it from the real work instead.
 */
function MissingCard({ result }: { result: GitStandup }) {
  const n = result.commits;
  const v = result.vague_commits;
  const word = result.vague_example ?? "wip";
  const from = `Written from ${n} commit ${n === 1 ? "message" : "messages"}.`;
  const caveat =
    v > 0 ? `${v} of them just said \u201c${word}\u201d.` : "Nothing else.";
  return (
    <div className="flex flex-col rounded-2xl bg-neutral-900 px-7 py-8 text-white shadow-2xl shadow-neutral-900/30 sm:px-9 sm:py-10 lg:sticky lg:top-28">
      <StaggerReveal>
        <StaggerItem>
          <p className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
            {from}
            <br />
            <span className="text-neutral-500">{caveat}</span>
          </p>
        </StaggerItem>
        <StaggerItem className="mt-8 border-t border-neutral-800 pt-8">
          <p className="text-xl font-semibold leading-tight tracking-[-0.02em] sm:text-2xl">
            Sign up and you never do this by hand again.
            <br />
            <span className="text-neutral-500">
              WriteLogs writes it from your real work, every day.
            </span>
          </p>
          <ul className="mt-6 space-y-2.5">
            {value(word).map((line) => (
              <li
                key={line}
                className="flex gap-3 text-base font-medium leading-snug sm:text-lg"
              >
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-white" />
                {line}
              </li>
            ))}
          </ul>
        </StaggerItem>
        <StaggerItem className="mt-8">
          <Link
            href="/signup"
            onClick={() => track("git_standup_cta_clicked")}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-medium text-neutral-900 transition-opacity hover:opacity-90"
          >
            Get it free
            <ArrowRight className="size-4" />
          </Link>
          <p className="mt-3 text-center text-sm text-neutral-500">
            Free. Two minutes to set up. Never paste a log again.
          </p>
        </StaggerItem>
      </StaggerReveal>
    </div>
  );
}

export function GitStandupTool() {
  const { form, onSubmit, isSubmitting, result, reset } = useGitStandup();
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? 0 : 16;

  return (
    <div id={TOOL_ID} className="scroll-mt-28">
      <AnimatePresence mode="wait" initial={false}>
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: rise }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -rise / 2 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="space-y-6"
          >
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <MissingCard result={result} />
              <ResultCard result={result} />
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              &larr; Paste another log
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: rise }}
            animate={{ opacity: isSubmitting ? 0.5 : 1, y: 0 }}
            exit={{ opacity: 0, y: -rise / 2 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="space-y-10"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">
                1. Run this in your repo
              </p>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-[13px] text-neutral-800">
                  {GIT_COMMAND}
                </code>
                <CopyButton text={GIT_COMMAND} />
              </div>
              <p className="mt-2 text-sm text-neutral-500">
                Monday? Use <code>--since=&quot;last friday&quot;</code>. Any{" "}
                <code>git log</code> format works, but <code>--stat</code> adds
                file names, which is what makes a &ldquo;wip&rdquo; commit
                explainable.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <p className="text-sm font-medium text-neutral-900">
                  2. Paste what it printed
                </p>
                <ControlledTextarea
                  name="log"
                  rows={10}
                  maxLength={MAX_LOG_CHARS}
                  placeholder={
                    "commit 3f2a1b9…\nAuthor: you\n\n    Add retry to webhook handler\n\n src/webhooks/handler.ts | 42 ++++---"
                  }
                  className="font-mono text-[13px] bg-white border border-neutral-200"
                  disabled={isSubmitting}
                />
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white h-12 px-6 rounded-full"
                  >
                    {isSubmitting ? "Writing…" : "Write my standup"}
                  </Button>
                  <span className="text-xs text-neutral-400">
                    Nothing is stored. The paste is summarised and forgotten.
                  </span>
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
