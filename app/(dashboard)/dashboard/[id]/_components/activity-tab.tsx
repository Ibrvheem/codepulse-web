"use client";

import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { useProject, useProjectLogsInfinite } from "../_hooks/use-project-data";
import {
  groupActivity,
  dayKeyFor,
  type CommitGroup,
} from "../_lib/group-activity";
import { formatDuration } from "@/lib/utils";
import type { LogEntry } from "@/lib/types";

function WorkRow({ row }: { row: LogEntry }) {
  const isAgent = row.source === "agent";
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
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
    </div>
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
          {group.rows.map((row) => (
            <WorkRow key={row.id} row={row} />
          ))}
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
      <div className="space-y-4">
        {timeline.uncommitted && (
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
              {timeline.uncommitted.rows.map((row) => (
                <WorkRow key={row.id} row={row} />
              ))}
            </div>
          </div>
        )}

        {timeline.days.map((section) => (
          <div key={section.day} className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground pt-2">
              {dayLabel(section.day)}
            </h3>
            {section.groups.map((group) => (
              <CommitGroupCard key={group.key} group={group} />
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
      </div>
    </TooltipProvider>
  );
}
