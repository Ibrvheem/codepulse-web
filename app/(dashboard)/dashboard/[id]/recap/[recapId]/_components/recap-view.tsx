"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";
import { AreaChips } from "@/components/area-chips";
import { isUpgradeRequired } from "@/lib/api-client";
import {
  ErrorState,
  UpgradeState,
} from "../../../../../_components/query-states";
import { useBilling } from "../../../../../_hooks/use-billing";
import { SummaryBullets } from "../../../_components/summary-bullets";
import { VoiceToggle } from "../../../_components/voice-toggle";
import { inVoice, useSummaryVoice } from "../../../_hooks/use-summary-voice";
import { useCreateRecap } from "../../../_hooks/use-recaps";
import { formatSpan, spanDays } from "../../../_lib/recap-range";
import { useRecap, useCopyRecap } from "../_hooks/use-recap";
import { ShareRecap } from "./share-recap";

export function RecapView({
  projectId,
  recapId,
}: {
  projectId: string;
  recapId: string;
}) {
  const { data: recap, isPending, isError, error, refetch, isRefetching } =
    useRecap(recapId);
  const copyRecap = useCopyRecap(recapId);
  const rebuild = useCreateRecap(projectId);
  const { voice, setVoice, isReady } = useSummaryVoice(projectId);
  const { data: billing } = useBilling();
  // Free plan: no first-person text and no copy endpoint — hide both controls
  // rather than show them disabled.
  const proVoice = billing?.limits.first_person_voice ?? true;

  const backLink = (
    <Link
      href={`/dashboard/${projectId}?tab=recaps`}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      ← Back to recaps
    </Link>
  );

  if (isPending) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-3 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    // Recaps outside the plan's history window come back as 402.
    if (isUpgradeRequired(error)) {
      return (
        <div className="space-y-4 max-w-2xl">
          {backLink}
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

  const start = recap.start_date.slice(0, 10);
  const end = recap.end_date.slice(0, 10);
  const span = spanDays({ start, end });

  return (
    <FadeIn className="space-y-8 max-w-2xl">
      <div>
        {backLink}
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {recap.title || formatSpan(start, end)}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">
              {formatSpan(start, end)} · {span} days · {recap.days_count} with
              activity · {recap.logs_count}{" "}
              {recap.logs_count === 1 ? "log" : "logs"}
              {recap.status !== "COMPLETED" && (
                <Badge variant="secondary" className="ml-2 align-middle">
                  {recap.status}
                </Badge>
              )}
            </p>
            {proVoice && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Voice</span>
                <VoiceToggle
                  value={voice}
                  onChange={setVoice}
                  disabled={!isReady}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ShareRecap recapId={recapId} />
            {/* Copied text is always the "I" voice — independent of the toggle. */}
            {proVoice && (
              <Button
                loading={copyRecap.isPending}
                onClick={() => copyRecap.mutate()}
              >
                Copy recap
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* The full roll-up — the list cards clamp it, this is where it reads. */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {inVoice(voice, recap.message, recap.message_first_person)}
      </p>

      <AreaChips areas={recap.areas} />

      {recap.tasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {voice === "i" ? "What I did" : "What you did"}
          </h2>
          <SummaryBullets tasks={recap.tasks} voice={voice} />
        </div>
      )}

      {/* Rebuilding the same span replaces this recap in place, so any share
          link keeps working — useful once later days get their summaries. */}
      <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Rebuild to pick up days that have been summarized since.
        </p>
        <Button
          variant="outline"
          size="sm"
          loading={rebuild.isPending}
          onClick={() => rebuild.mutate({ start, end })}
        >
          Rebuild
        </Button>
      </div>
    </FadeIn>
  );
}
