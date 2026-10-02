"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EASE_OUT } from "@/components/motion/stagger-reveal";
import { useProjectAreas, useRenameArea } from "../_hooks/use-areas";

/**
 * The project's area vocabulary: every name its bullets use, and a way to fix
 * one. Renaming is project-wide, so this shows the whole list rather than a
 * single name. Seeing the other areas is what makes the scope obvious, which
 * a lone input on a heading could never do.
 *
 * There is no add or delete: the list is whatever the bullets say, so an area
 * exists because work landed in it.
 */
export function AreasPanel({
  projectId,
  highlight,
  enabled = true,
}: {
  projectId: string;
  /** Scroll-free emphasis for the area the user arrived from. */
  highlight?: string;
  /** False while a containing dialog is closed, to skip the fetch. */
  enabled?: boolean;
}) {
  const { data: areas, isPending } = useProjectAreas(projectId, enabled);
  const rename = useRenameArea(projectId);
  const reduceMotion = useReducedMotion();
  const [editing, setEditing] = useState<string | null>(highlight ?? null);
  const [draft, setDraft] = useState(highlight ?? "");

  const start = (name: string) => {
    setEditing(name);
    setDraft(name);
  };

  const submit = () => {
    const to = draft.trim();
    if (!editing || !to || to === editing) {
      setEditing(null);
      return;
    }
    rename.mutate({ from: editing, to }, { onSettled: () => setEditing(null) });
  };

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  }

  if (!areas || areas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        None yet. Areas are named as your summaries are written, so they show
        up once you have a summary or two.
      </p>
    );
  }

  const target = draft.trim();
  const unchanged = target === editing;
  const merging = Boolean(editing && !unchanged && areas.some((a) => a.name === target));
  const canSave = Boolean(target) && !unchanged;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        How your work gets grouped. Renaming one updates every summary and
        recap in this project, and future ones use the new name. Renaming onto
        a name that already exists merges the two.
      </p>
      <ul className="divide-y border rounded-lg overflow-hidden">
        <AnimatePresence initial={false}>
          {areas.map((area) => (
            <motion.li
              key={area.name}
              // "position" and not plain `layout`: the row slides up when a
              // merge removes the one above it, but it must not animate its
              // own size. The grid below keeps the height fixed to the taller
              // half, so there is no size change worth animating and nothing
              // to disagree with the swap inside.
              // It is a position change, so it is the first thing to go under
              // reduced motion; the fades stay, since those aid comprehension.
              layout={reduceMotion ? false : "position"}
              exit={{
                opacity: 0,
                transform: reduceMotion ? "none" : "scale(0.98)",
              }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              // Fixed height so the row never resizes between its two states.
              // The swap itself is deliberately not animated: at 44px there is
              // nothing to follow, and every attempt to animate it read as a
              // flicker.
              className={`grid h-11 grid-cols-1 items-center px-3 ${
                area.name === highlight && editing !== area.name
                  ? "bg-muted/40"
                  : ""
              }`}
            >
                        {editing === area.name ? (
              // Full width while editing: the old name stays on the left so
              // you can see what you're changing, and the hint line has room
              // to explain a merge before you commit to one.
              <form
                className="col-start-1 row-start-1 flex w-full items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
              >
                <span className="shrink-0 text-sm text-muted-foreground">
                    {area.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">&rarr;</span>
                  <Input
                    autoFocus
                    value={draft}
                    maxLength={40}
                    placeholder="New name"
                    className="h-7 flex-1 min-w-0 text-sm"
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setEditing(null);
                    }}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <Button
                    type="submit"
                    size="xs"
                    variant="outline"
                    loading={rename.isPending}
                    disabled={!canSave}
                  >
                    {merging ? "Merge" : "Rename"}
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>
              </form>
            ) : (
              <div
                className="col-start-1 row-start-1 flex w-full items-center justify-between gap-3"
              >
                <span className="min-w-0 text-sm truncate">{area.name}</span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {area.uses} {area.uses === 1 ? "bullet" : "bullets"}
                  </span>
                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={rename.isPending}
                    onClick={() => start(area.name)}
                  >
                    Rename
                  </Button>
                </span>
              </div>
            )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Outside the list on purpose: inside a row it resized that row on
          every keystroke that matched an existing name. */}
      <AnimatePresence initial={false}>
        {merging && (
          <motion.p
            initial={{
              opacity: 0,
              transform: reduceMotion ? "none" : "translateY(-4px)",
            }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="text-xs text-muted-foreground"
          >
            {target} already exists. Renaming will merge the two areas into
            one.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
