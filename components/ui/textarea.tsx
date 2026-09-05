"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Multi-line sibling of `Input` — same surface, no hover glow. */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <div className="rounded-lg p-[2px]">
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md border-none bg-gray-100 px-3 py-2 text-sm text-black transition duration-400 placeholder:text-neutral-500 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 resize-y",
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
Textarea.displayName = "Textarea";

export { Textarea };
