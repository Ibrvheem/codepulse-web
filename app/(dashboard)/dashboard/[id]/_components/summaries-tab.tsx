"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { PaginationControls } from "../../../_components/pagination-controls";
import { useProject, useProjectSummaries } from "../_hooks/use-project-data";
import {
  useGenerateSummary,
  useSummaryUsage,
} from "../_hooks/use-generate-summary";
import type { Summary } from "@/lib/types";

dayjs.extend(relativeTime);

/**
 * "Today" for a project is bounded by its own timezone, not the browser's —
 * that's what the timezone field on the project is for.
 */
function projectDay(timezone: string | undefined, daysAgo = 0): string {
  const date = new Date(Date.now() - daysAgo * 86_400_000);
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA").format(date);
  }
}

export function SummariesTab({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjectSummaries(projectId, page);
  const { data: project } = useProject(projectId);
  const generate = useGenerateSummary(projectId);
  const usage = useSummaryUsage(projectId);

  const today = projectDay(project?.timezone);
  const yesterday = projectDay(project?.timezone, 1);
  const dayKey = (summary: Summary) => summary.date.slice(0, 10);

  const dayBadge = (summary: Summary) => {
    const key = dayKey(summary);
    if (key === today) return <Badge>Today</Badge>;
    if (key === yesterday) return <Badge variant="secondary">Yesterday</Badge>;
    return <Badge variant="secondary">{dayjs(key).fromNow()}</Badge>;
  };

  const limitReached =
    usage?.exhausted ||
    (usage?.used != null && usage.limit != null && usage.used >= usage.limit);

  // The API only reports usage on generate responses, so until the first
  // update of the session we can state the daily allowance but not what's
  // left of it.
  const DEFAULT_MANUAL_LIMIT = 3;
  const remainingLabel =
    usage?.used != null && usage.limit != null
      ? `${Math.max(0, usage.limit - usage.used)} of ${usage.limit} updates left today`
      : usage?.exhausted
        ? "No updates left today"
        : `Up to ${DEFAULT_MANUAL_LIMIT} manual updates a day`;

  // The update action only ever affects today's summary, so it lives on
  // today's card (or its placeholder) — never floating above the list.
  const updateControls = (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground tabular-nums">
        {remainingLabel}
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span so the tooltip still fires when the button is disabled */}
            <span>
              <Button
                size="sm"
                loading={generate.isPending}
                disabled={limitReached}
                onClick={() => generate.mutate()}
              >
                Update summary
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            The counter resets daily — and summaries also update automatically
            every night, which doesn&apos;t use your updates.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
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

  if (data.data.length === 0) {
    return generate.data?.generated === 0 ? (
      <EmptyState
        title="No activity captured yet today"
        description="Once the VS Code extension logs some work you can build today's summary here — and tonight's automatic summary will pick up everything either way."
      >
        {updateControls}
      </EmptyState>
    ) : (
      <EmptyState
        title="No summaries yet"
        description="Summaries are written automatically every night. Already coded today? Build today's now."
      >
        {updateControls}
      </EmptyState>
    );
  }

  const todaySummary =
    page === 1 ? data.data.find((s) => dayKey(s) === today) : undefined;
  const pastSummaries = data.data.filter((s) => s !== todaySummary);

  return (
    <div className="space-y-3">
      {todaySummary ? (
        <div className="border rounded-lg p-4 bg-card">
          <Link
            href={`/dashboard/${projectId}/summary/${todaySummary.id}`}
            className="block group"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium group-hover:underline underline-offset-4">
                {todaySummary.title}
              </p>
              <span className="flex items-center gap-1.5 shrink-0">
                <Badge>Today</Badge>
                {todaySummary.status !== "COMPLETED" && (
                  <Badge variant="secondary">{todaySummary.status}</Badge>
                )}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {todaySummary.message}
            </p>
            <p className="text-xs text-muted-foreground mt-3 tabular-nums">
              {dayjs(todaySummary.date).format("ddd, MMM D YYYY")} ·{" "}
              {todaySummary.logs_count}{" "}
              {todaySummary.logs_count === 1 ? "log" : "logs"} ·{" "}
              {todaySummary.tasks.length}{" "}
              {todaySummary.tasks.length === 1 ? "task" : "tasks"}
            </p>
          </Link>
          <div className="mt-3 pt-3 border-t flex items-center justify-end">
            {updateControls}
          </div>
        </div>
      ) : (
        page === 1 && (
          <div className="border border-dashed rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Today</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                No summary yet — build one from today&apos;s logs so far.
              </p>
            </div>
            {updateControls}
          </div>
        )
      )}

      {pastSummaries.map((summary) => (
        <Link
          key={summary.id}
          href={`/dashboard/${projectId}/summary/${summary.id}`}
          className="block border rounded-lg p-4 bg-card transition-all duration-200 hover:border-foreground/25 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{summary.title}</p>
            <span className="flex items-center gap-1.5 shrink-0">
              {dayBadge(summary)}
              {summary.status !== "COMPLETED" && (
                <Badge variant="secondary">{summary.status}</Badge>
              )}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {summary.message}
          </p>
          <p className="text-xs text-muted-foreground mt-3 tabular-nums">
            {dayjs(summary.date).format("ddd, MMM D YYYY")} ·{" "}
            {summary.logs_count} {summary.logs_count === 1 ? "log" : "logs"} ·{" "}
            {summary.tasks.length}{" "}
            {summary.tasks.length === 1 ? "task" : "tasks"}
          </p>
        </Link>
      ))}

      <PaginationControls meta={data.meta} onPageChange={setPage} />
    </div>
  );
}
