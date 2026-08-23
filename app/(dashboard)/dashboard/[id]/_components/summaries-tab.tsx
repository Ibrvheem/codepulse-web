"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { PaginationControls } from "../../../_components/pagination-controls";
import { useProjectSummaries } from "../_hooks/use-project-data";
import { useGenerateSummary } from "../_hooks/use-generate-summary";

export function SummariesTab({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjectSummaries(projectId, page);
  const generate = useGenerateSummary(projectId);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          loading={generate.isPending}
          onClick={() => generate.mutate()}
        >
          Summarize today
        </Button>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          message={error.message}
          onRetry={() => refetch()}
          retrying={isRefetching}
        />
      ) : data.data.length === 0 ? (
        <EmptyState
          title="No summaries yet"
          description='Summaries are written automatically at the end of each day. Already coded today? Hit "Summarize today" to get one now.'
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((summary) => (
              <Link
                key={summary.id}
                href={`/dashboard/${projectId}/summary/${summary.id}`}
                className="block border rounded-lg p-4 bg-card transition-all duration-200 hover:border-foreground/25 hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{summary.title}</p>
                  {summary.status !== "COMPLETED" && (
                    <Badge variant="secondary">{summary.status}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {summary.message}
                </p>
                <p className="text-xs text-muted-foreground mt-3 tabular-nums">
                  {dayjs(summary.date).format("ddd, MMM D YYYY")} ·{" "}
                  {summary.logs_count}{" "}
                  {summary.logs_count === 1 ? "log" : "logs"} ·{" "}
                  {summary.tasks.length}{" "}
                  {summary.tasks.length === 1 ? "task" : "tasks"}
                </p>
              </Link>
            ))}
          </div>
          <PaginationControls meta={data.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
