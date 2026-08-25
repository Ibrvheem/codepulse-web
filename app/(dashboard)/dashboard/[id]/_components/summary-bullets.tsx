"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EASE_OUT } from "@/components/motion/stagger-reveal";
import { formatDuration } from "@/lib/utils";
import type { SummaryTask, SummaryVoice } from "@/lib/types";
import { inVoice } from "../_hooks/use-summary-voice";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

function TaskBullet({ task, voice }: { task: SummaryTask; voice: SummaryVoice }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const hasDetails = Boolean(
    task.description.trim() || task.files.length > 0 || task.tags.length > 0,
  );
  const minutes =
    task.time_minutes >= 1 ? `~${formatDuration(task.time_minutes * 60_000)}` : null;

  // Bullets arrive without a trailing period — leave them that way.
  const label = inVoice(voice, task.task, task.task_first_person);

  const item: Variants = {
    hidden: { opacity: 0, transform: reduceMotion ? "none" : "translateY(6px)" },
    show: {
      opacity: 1,
      transform: "translateY(0px)",
      transition: { duration: 0.25, ease: EASE_OUT },
    },
  };

  const row = (
    <>
      <span className="mt-[9px] size-1.5 rounded-full bg-foreground/70 shrink-0" />
      <span className="flex-1 min-w-0 text-sm text-left">{label}</span>
      <span className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground tabular-nums">
        {minutes && <span>{minutes}</span>}
        {hasDetails && (
          <ChevronRight
            className={`size-3.5 transition-transform duration-200 ease-out ${
              open ? "rotate-90" : ""
            }`}
          />
        )}
      </span>
    </>
  );

  return (
    <motion.li variants={item}>
      {hasDetails ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group flex w-full items-start gap-2.5 rounded-md -mx-2 px-2 py-1.5 hover:bg-muted/60 transition-colors"
        >
          {row}
        </button>
      ) : (
        <div className="flex items-start gap-2.5 -mx-2 px-2 py-1.5">{row}</div>
      )}
      {/* Accordion: height is the one property with no transform equivalent. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="details"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 mb-2 pl-3 border-l space-y-2">
              {task.description.trim() && (
                <p className="text-sm text-foreground/80">{task.description}</p>
              )}
              {task.files.length > 0 && (
                <p className="font-mono text-xs text-muted-foreground break-all">
                  {task.files.join("  ")}
                </p>
              )}
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/** The primary read of a summary: one bullet per task, the technical how on tap. */
export function SummaryBullets({
  tasks,
  voice,
}: {
  tasks: SummaryTask[];
  voice: SummaryVoice;
}) {
  if (tasks.length === 0) return null;
  return (
    <motion.ul
      className="space-y-0.5"
      variants={list}
      initial="hidden"
      animate="show"
    >
      {tasks.map((task) => (
        <TaskBullet key={task.id} task={task} voice={voice} />
      ))}
    </motion.ul>
  );
}
