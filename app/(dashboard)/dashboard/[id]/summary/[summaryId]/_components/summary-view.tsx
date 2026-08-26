"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";
import { isUpgradeRequired } from "@/lib/api-client";
import { ErrorState, UpgradeState } from "../../../../../_components/query-states";
import { useBilling } from "../../../../../_hooks/use-billing";
import { SummaryBullets } from "../../../_components/summary-bullets";
import { VoiceToggle } from "../../../_components/voice-toggle";
import { inVoice, useSummaryVoice } from "../../../_hooks/use-summary-voice";
import { useSummary, useCopyStandup } from "../_hooks/use-summary";
import { ShareSummary } from "./share-summary";

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
  const { voice, setVoice, isReady } = useSummaryVoice(projectId);
  const { data: billing } = useBilling();
  // Free plan: no first-person text and no standup endpoint — hide both
  // controls rather than show them disabled.
  const proVoice = billing?.limits.first_person_voice ?? true;

  if (isPending) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-3 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    // Summaries outside the free plan's history window come back as 402.
    if (isUpgradeRequired(error)) {
      return (
        <div className="space-y-4 max-w-2xl">
          <Link
            href={`/dashboard/${projectId}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to project
          </Link>
          <UpgradeState message={error.message} />
        </div>
      );
    }
    return (
      <ErrorState
        message={error.message}
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  }

  const hasTasks = summary.tasks.length > 0;

  return (
    <FadeIn className="space-y-8 max-w-2xl">
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
          <div className="flex items-center gap-3 shrink-0">
            {proVoice && (
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Voice</span>
                <VoiceToggle value={voice} onChange={setVoice} disabled={!isReady} />
              </span>
            )}
            <ShareSummary summaryId={summaryId} />
            {/* Standup text is always the "I" voice with bullets — independent of the toggle. */}
            {proVoice && (
              <Button
                loading={copyStandup.isPending}
                onClick={() => copyStandup.mutate()}
              >
                Copy as standup
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* The full recap — the list cards clamp it, this is where it reads in full. */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {inVoice(voice, summary.message, summary.message_first_person)}
      </p>

      {hasTasks && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {voice === "i" ? "What I did" : "What you did"}
          </h2>
          <SummaryBullets tasks={summary.tasks} voice={voice} />
        </div>
      )}
    </FadeIn>
  );
}
