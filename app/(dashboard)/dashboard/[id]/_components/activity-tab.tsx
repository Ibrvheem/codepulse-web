"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { PaginationControls } from "../../../_components/pagination-controls";
import { useProjectLogs } from "../_hooks/use-project-data";
import { formatDuration } from "@/lib/utils";

dayjs.extend(relativeTime);

export function ActivityTab({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjectLogs(projectId, page);

  if (isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
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
    return (
      <EmptyState
        title="No activity yet"
        description="Once the VS Code extension is set up with a project key, every coding session and commit lands here automatically. Head to the Keys tab to connect it."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Changes</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((log) => {
              const isCommit = log.source === "commit";
              return (
                <TableRow key={log.id}>
                  <TableCell className="max-w-[280px]">
                    <p className="font-mono text-xs truncate">
                      {log.file_path}
                    </p>
                    {isCommit && (
                      <p className="flex items-center gap-1.5 mt-1 min-w-0">
                        <Badge
                          variant="secondary"
                          className="shrink-0 font-mono text-[10px]"
                        >
                          commit
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {log.commit_message ?? log.commit_hash}
                        </span>
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.branch ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums whitespace-nowrap">
                    <span className="text-win">+{log.lines_added}</span>{" "}
                    <span className="text-loss">−{log.lines_removed}</span>
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {formatDuration(log.active_ms)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    {dayjs(log.started_at).fromNow()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <PaginationControls meta={data.meta} onPageChange={setPage} />
    </div>
  );
}
