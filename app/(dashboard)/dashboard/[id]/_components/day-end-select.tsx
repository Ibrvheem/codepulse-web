"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { DAY_END_OPTIONS } from "@/lib/project-day";

/**
 * One straight line of half-hour pills — same sliding pill as Voice. The row
 * scrolls sideways (chevrons, trackpad, or a vertical wheel), the native
 * scrollbar is hidden, and the edges fade to hint there's more.
 */
export function DayEndSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const centeredOnce = useRef(false);
  // Which way there is still room to scroll — drives the chevron states.
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges]);

  // Center the saved value once the project has loaded, then leave it alone.
  useEffect(() => {
    if (centeredOnce.current || disabled || !activeRef.current) return;
    centeredOnce.current = true;
    activeRef.current.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "instant",
    });
    updateEdges();
  }, [value, disabled, updateEdges]);

  // Vertical wheel → horizontal scroll (mice have no sideways wheel).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const page = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  };

  const chevronClass =
    "shrink-0 rounded-md p-1 text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-muted hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Earlier times"
        disabled={!canScroll.left}
        onClick={() => page(-1)}
        className={chevronClass}
      >
        <ChevronLeft className="size-4" />
      </button>
      <div
        ref={trackRef}
        onScroll={updateEdges}
        role="radiogroup"
        aria-label="Time the day ends"
        className="flex min-w-0 flex-1 items-center gap-[3px] overflow-x-auto rounded-lg bg-muted p-[3px] text-xs font-medium [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]"
      >
        {DAY_END_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              ref={active ? activeRef : undefined}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => !active && onChange(option.value)}
              className={`relative shrink-0 px-3 py-1 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap tabular-nums ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="day-end-pill"
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
      <button
        type="button"
        aria-label="Later times"
        disabled={!canScroll.right}
        onClick={() => page(1)}
        className={chevronClass}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
