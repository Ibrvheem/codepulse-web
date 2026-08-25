"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { useProject, useProjectLogsInfinite } from "../_hooks/use-project-data";
import {
  groupActivity,
  dayKeyFor,
  type CommitGroup,
} from "../_lib/group-activity";
import { EASE_OUT } from "@/components/motion/stagger-reveal";
import { formatDuration } from "@/lib/utils";
import type { LogEntry } from "@/lib/types";

/**
 * Rows arriving from the 30s poll fade in; rows absorbed by a commit fade
 * out. Wrapped in <AnimatePresence initial={false}> by callers so the first
 * render doesn't double-animate under the card's own entrance.
 */
function WorkRow({ row }: { row: LogEntry }) {
  const isAgent = row.source === "agent";
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      layout={!reduceMotion}
      initial={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(-4px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      exit={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(-4px)" }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="flex items-center justify-between gap-3 py-1.5"
    >
      <p className="font-mono text-xs truncate">{row.file_path}</p>
      <span className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
        <span className="whitespace-nowrap">
          <span className="text-win">+{row.lines_added}</span>{" "}
          <span className="text-loss">−{row.lines_removed}</span>
        </span>
        {isAgent ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="font-mono text-[10px]">
                AI
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              Written by an AI coding tool — captured before commit.
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground whitespace-nowrap">
            you · {formatDuration(row.active_ms)}
          </span>
        )}
      </span>
    </motion.div>
  );
}

function CommitGroupCard({ group }: { group: CommitGroup }) {
  return (
    <div className="border rounded-lg bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-sm flex items-center gap-2 min-w-0">
          <span className="size-2 rounded-full bg-foreground shrink-0" />
          <span className="truncate">{group.message}</span>
        </p>
        <p className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {group.shortHash && (
            <span className="font-mono">{group.shortHash}</span>
          )}
          {" · "}
          {dayjs(group.time).format("h:mm A")}
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-1 ml-4 tabular-nums">
        <span className="text-win">+{group.linesAdded}</span>{" "}
        <span className="text-loss">−{group.linesRemoved}</span> ·{" "}
        {group.fileCount} {group.fileCount === 1 ? "file" : "files"}
        {group.branch && ` · ${group.branch}`}
      </p>
      {group.rows.length > 0 && (
        <div className="mt-2 ml-[3px] border-l pl-4">
          <AnimatePresence initial={false}>
            {group.rows.map((row) => (
              <WorkRow key={row.id} row={row} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export function ActivityTab({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProjectLogsInfinite(projectId);

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  }

  const entries = data.pages.flatMap((page) => page.data);

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Start coding — activity appears here within a minute. Not connected yet? Grab an API key in the Keys tab."
      />
    );
  }

  const timezone = project?.timezone;
  const timeline = groupActivity(entries, timezone);
  const today = dayKeyFor(new Date().toISOString(), timezone);
  const yesterday = dayKeyFor(
    new Date(Date.now() - 86_400_000).toISOString(),
    timezone,
  );
  const dayLabel = (day: string) =>
    day === today
      ? "Today"
      : day === yesterday
        ? "Yesterday"
        : dayjs(day).format("dddd, MMM D");

  return (
    <TooltipProvider>
      <StaggerReveal className="space-y-4">
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-win opacity-75 animate-ping motion-reduce:animate-none" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-win" />
                </span>
                Live
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Checks for new activity every 30 seconds.
            </TooltipContent>
          </Tooltip>
        </div>
        {timeline.uncommitted && (
          <StaggerItem>
            <div className="border border-dashed rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-sm flex items-center gap-2">
                  <span className="size-2 rounded-full border border-foreground/60 shrink-0" />
                  Uncommitted
                </p>
                {timeline.uncommitted.branch && (
                  <p className="text-xs text-muted-foreground">
                    {timeline.uncommitted.branch}
                  </p>
                )}
              </div>
              <div className="mt-2 ml-[3px] border-l border-dashed pl-4">
                <AnimatePresence initial={false}>
                  {timeline.uncommitted.rows.map((row) => (
                    <WorkRow key={row.id} row={row} />
                  ))}
                </AnimatePresence>
                {timeline.uncommitted.revertedCount > 0 && (
                  <p className="py-1.5 text-xs text-muted-foreground">
                    {timeline.uncommitted.revertedCount} reverted{" "}
                    {timeline.uncommitted.revertedCount === 1
                      ? "edit"
                      : "edits"}{" "}
                    · no net change
                  </p>
                )}
              </div>
            </div>
          </StaggerItem>
        )}

        {timeline.days.map((section) => (
          <div key={section.day} className="space-y-2">
            <StaggerItem>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground pt-2">
                {dayLabel(section.day)}
              </h3>
            </StaggerItem>
            {section.groups.map((group) => (
              <StaggerItem key={group.key}>
                <CommitGroupCard group={group} />
              </StaggerItem>
            ))}
          </div>
        ))}

        {hasNextPage && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              loading={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              Load older activity
            </Button>
          </div>
        )}
      </StaggerReveal>
    </TooltipProvider>
  );
}
