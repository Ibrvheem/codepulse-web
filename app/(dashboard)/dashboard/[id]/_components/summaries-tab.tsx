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
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { PaginationControls } from "../../../_components/pagination-controls";
import { useProject, useProjectSummaries } from "../_hooks/use-project-data";
import {
  useGenerateSummary,
  useSummaryUsage,
} from "../_hooks/use-generate-summary";
import { inVoice, useSummaryVoice } from "../_hooks/use-summary-voice";
import { useBilling } from "../../../_hooks/use-billing";
import { BILLING_PATH } from "../../../_hooks/use-upgrade-toast";
import { VoiceToggle } from "./voice-toggle";
import type { Summary, SummaryVoice } from "@/lib/types";

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

function SummaryCard({
  summary,
  voice,
  projectId,
  badges,
  footer,
}: {
  summary: Summary;
  voice: SummaryVoice;
  projectId: string;
  badges: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    // The title link stretches over the whole card (::after overlay); the
    // footer controls sit above it so they stay independently clickable.
    <div className="group relative border rounded-lg p-4 bg-card transition-all duration-200 hover:border-foreground/25 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/dashboard/${projectId}/summary/${summary.id}`}
          className="font-medium after:absolute after:inset-0 after:content-['']"
        >
          {summary.title}
        </Link>
        <span className="flex items-center gap-1.5 shrink-0">
          {badges}
          {summary.status !== "COMPLETED" && (
            <Badge variant="secondary">{summary.status}</Badge>
          )}
        </span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
        {inVoice(voice, summary.message, summary.message_first_person)}
      </p>
      <p className="text-xs text-muted-foreground mt-3 tabular-nums">
        {dayjs(summary.date).format("ddd, MMM D YYYY")} · {summary.logs_count}{" "}
        {summary.logs_count === 1 ? "log" : "logs"} · {summary.tasks.length}{" "}
        {summary.tasks.length === 1 ? "task" : "tasks"}
      </p>
      {footer && (
        <div className="relative z-10 mt-3 pt-3 border-t flex items-center justify-end">
          {footer}
        </div>
      )}
    </div>
  );
}

export function SummariesTab({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjectSummaries(projectId, page);
  const { data: project } = useProject(projectId);
  const generate = useGenerateSummary(projectId);
  const usage = useSummaryUsage(projectId);
  const { voice, setVoice, isReady } = useSummaryVoice(projectId);
  const { data: billingInfo } = useBilling();
  // Free plan: first-person text comes back empty, so the toggle has nothing
  // to switch — hide it rather than show a dead control.
  const canSwitchVoice = billingInfo?.limits.first_person_voice ?? true;

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
  const manualLimit =
    usage?.limit ?? billingInfo?.limits.manual_updates_per_day ?? 3;
  const remainingLabel =
    usage?.used != null
      ? `${Math.max(0, manualLimit - usage.used)} of ${manualLimit} updates left today`
      : usage?.exhausted
        ? "No updates left today"
        : `Up to ${manualLimit} manual ${manualLimit === 1 ? "update" : "updates"} a day`;

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

  // Voice switch applies to every summary on the tab and persists per project.
  const voiceRow = (
    <div className="flex items-center justify-between gap-3">
      {canSwitchVoice ? (
        <span className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Voice</span>
          <VoiceToggle value={voice} onChange={setVoice} disabled={!isReady} />
        </span>
      ) : (
        <span />
      )}
      {data && data.meta.total > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {data.meta.total} {data.meta.total === 1 ? "summary" : "summaries"}
        </span>
      )}
    </div>
  );

  let content: React.ReactNode;

  if (isPending) {
    content = (
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
  } else if (isError) {
    content = (
      <ErrorState
        message={error.message}
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  } else if (data.data.length === 0) {
    content =
      generate.data?.generated === 0 ? (
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
  } else {
    const todaySummary =
      page === 1 ? data.data.find((s) => dayKey(s) === today) : undefined;
    const pastSummaries = data.data.filter((s) => s !== todaySummary);

    content = (
      <StaggerReveal className="space-y-3">
        {todaySummary ? (
          <StaggerItem>
            <SummaryCard
              summary={todaySummary}
              voice={voice}
              projectId={projectId}
              badges={<Badge>Today</Badge>}
              footer={updateControls}
            />
          </StaggerItem>
        ) : (
          page === 1 && (
            <StaggerItem>
              <div className="border border-dashed rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Today</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    No summary yet — build one from today&apos;s logs so far.
                  </p>
                </div>
                {updateControls}
              </div>
            </StaggerItem>
          )
        )}

        {pastSummaries.map((summary) => (
          <StaggerItem key={summary.id}>
            <SummaryCard
              summary={summary}
              voice={voice}
              projectId={projectId}
              badges={dayBadge(summary)}
            />
          </StaggerItem>
        ))}

        {data.locked > 0 && !data.meta.has_next_page && (
          <StaggerItem>
            <div className="border border-dashed rounded-lg px-4 py-3 text-sm text-muted-foreground">
              <span aria-hidden>🔒</span> {data.locked} older{" "}
              {data.locked === 1 ? "summary" : "summaries"} —{" "}
              <Link
                href={BILLING_PATH}
                className="text-foreground underline underline-offset-4"
              >
                upgrade to see your full history
              </Link>
              .
            </div>
          </StaggerItem>
        )}

        <PaginationControls meta={data.meta} onPageChange={setPage} />
      </StaggerReveal>
    );
  }

  return (
    <div className="space-y-4">
      {voiceRow}
      {content}
    </div>
  );
}
