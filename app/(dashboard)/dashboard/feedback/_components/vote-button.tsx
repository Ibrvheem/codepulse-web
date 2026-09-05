"use client";

import { ChevronUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useVote } from "../_hooks/use-vote";

/**
 * ▲ count pill. Flips instantly (optimistic) — the endpoints are idempotent
 * so a double-click can't drift the count.
 */
export function VoteButton({
  id,
  count,
  hasVoted,
  size = "md",
}: {
  id: string;
  count: number;
  hasVoted: boolean;
  size?: "md" | "lg";
}) {
  const vote = useVote();
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      aria-pressed={hasVoted}
      aria-label={hasVoted ? "Remove your upvote" : "Upvote"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        vote.mutate({ id, has_voted: hasVoted });
      }}
      className={`group/vote flex flex-col items-center justify-center rounded-md border transition-colors select-none outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
        size === "lg" ? "w-14 py-2 gap-0.5" : "w-11 py-1.5"
      } ${
        hasVoted
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
      }`}
    >
      <motion.span
        // A tiny lift on the arrow when it flips to "voted".
        animate={hasVoted && !reduceMotion ? { y: [0, -3, 0] } : { y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex"
      >
        <ChevronUp
          className={size === "lg" ? "size-5" : "size-4"}
          strokeWidth={2.5}
        />
      </motion.span>
      <span
        className={`font-semibold tabular-nums leading-none ${
          size === "lg" ? "text-base" : "text-sm"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
