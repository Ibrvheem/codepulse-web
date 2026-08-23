"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";
import {
  StaggerReveal,
  StaggerItem,
} from "@/components/motion/stagger-reveal";
import { formatDuration } from "@/lib/utils";
import { ErrorState } from "../../../../../_components/query-states";
import { useSummary, useCopyStandup } from "../_hooks/use-summary";

export function SummaryView({
  projectId,
  summaryId,
}: {
  projectId: string;
  summaryId: string;
}) {
  const { data: summary, isPending, isError, error, refetch, isRefetching } =
    useSummary(summaryId);
  const copyStandup = useCopyStandup(summaryId);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-3 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
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

  return (
    <FadeIn className="space-y-6 max-w-2xl">
      <div>
        <Link
          href={`/dashboard/${projectId}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to project
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {summary.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">
              {dayjs(summary.date).format("dddd, MMM D YYYY")} ·{" "}
              {summary.logs_count} {summary.logs_count === 1 ? "log" : "logs"}
              {summary.status !== "COMPLETED" && (
                <Badge variant="secondary" className="ml-2 align-middle">
                  {summary.status}
                </Badge>
              )}
            </p>
          </div>
          <Button
            loading={copyStandup.isPending}
            onClick={() => copyStandup.mutate()}
            className="shrink-0"
          >
            Copy as standup
          </Button>
        </div>
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {summary.message}
      </p>

      {summary.tasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tasks
          </h2>
          <StaggerReveal className="space-y-3">
            {summary.tasks.map((task) => (
              <StaggerItem key={task.id}>
                <div className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{task.task}</p>
                    {task.time_minutes >= 1 && (
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        ~{formatDuration(task.time_minutes * 60_000)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                  {task.files.length > 0 && (
                    <p className="font-mono text-xs text-muted-foreground mt-2 truncate">
                      {task.files.join("  ")}
                    </p>
                  )}
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      )}
    </FadeIn>
  );
}
