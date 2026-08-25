"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SummaryVoice } from "@/lib/types";

const OPTIONS: { value: SummaryVoice; label: string }[] = [
  { value: "you", label: "You" },
  { value: "i", label: "I" },
];

/** Segmented control for the summary voice — same sliding pill as the tabs. */
export function VoiceToggle({
  value,
  onChange,
  disabled,
}: {
  value: SummaryVoice;
  onChange: (voice: SummaryVoice) => void;
  disabled?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="Summary voice"
      className="inline-flex items-center rounded-lg bg-muted p-[3px] text-xs font-medium"
    >
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => !active && onChange(option.value)}
            className={`relative px-3 py-1 rounded-md transition-colors disabled:opacity-50 ${
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <motion.span
                layoutId="summary-voice-pill"
                className="absolute inset-0 rounded-md bg-background shadow-sm dark:border dark:border-input dark:bg-input/30"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.5, bounce: 0.2 }
                }
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
