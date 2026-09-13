"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import { EmptyState, ErrorState } from "../../../_components/query-states";
import { PaginationControls } from "../../../_components/pagination-controls";
import { BILLING_PATH } from "../../../_hooks/use-upgrade-toast";
import { useBilling } from "../../../_hooks/use-billing";
import { useProjectRecaps, useDeleteRecap } from "../_hooks/use-recaps";
import { useUpdateBudget } from "../_hooks/use-update-budget";
import { inVoice, useSummaryVoice } from "../_hooks/use-summary-voice";
import { formatSpan, spanDays } from "../_lib/recap-range";
import { VoiceToggle } from "./voice-toggle";
import { NewRecapDialog } from "./new-recap-dialog";
import type { Recap, SummaryVoice } from "@/lib/types";

function day(value: string): string {
  return value.slice(0, 10);
}

function RecapCard({
  recap,
  voice,
  projectId,
  onDelete,
}: {
  recap: Recap;
  voice: SummaryVoice;
  projectId: string;
  onDelete: () => void;
}) {
  const start = day(recap.start_date);
  const end = day(recap.end_date);

  return (
    // The title link stretches over the whole card (::after overlay); the
    // delete control sits above it so it stays independently clickable.
    <div className="group relative border rounded-lg p-4 bg-card transition-all duration-200 hover:border-foreground/25 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/dashboard/${projectId}/recap/${recap.id}`}
          className="font-medium after:absolute after:inset-0 after:content-['']"
        >
          {recap.title || formatSpan(start, end)}
        </Link>
        <span className="flex items-center gap-1.5 shrink-0">
          <Badge variant="secondary" className="tabular-nums">
            {spanDays({ start, end })} days
          </Badge>
          {recap.status !== "COMPLETED" && (
            <Badge variant="secondary">{recap.status}</Badge>
          )}
        </span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
        {inVoice(voice, recap.message, recap.message_first_person)}
      </p>
      <p className="text-xs text-muted-foreground mt-3 tabular-nums">
        {formatSpan(start, end)} · {recap.days_count}{" "}
        {recap.days_count === 1 ? "active day" : "active days"} ·{" "}
        {recap.tasks.length} {recap.tasks.length === 1 ? "theme" : "themes"}
      </p>
      <div className="relative z-10 mt-3 pt-3 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Built {dayjs(recap.created_at).format("MMM D")}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

/** Recaps: one summary across a span of days — a week, a sprint, a month. */
export function RecapsTab({ projectId }: { projectId: string }) {
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Recap | null>(null);
  const { data, isPending, isError, error, refetch, isRefetching } =
    useProjectRecaps(projectId, page);
  const { voice, setVoice, isReady } = useSummaryVoice(projectId);
  const { data: billing } = useBilling();
  const remove = useDeleteRecap(projectId);
  const { data: budget } = useUpdateBudget(projectId);

  // Assume allowed until billing loads, so the tab never flashes the paywall.
  const canRecap = billing?.limits.recaps ?? true;
  const canSwitchVoice = billing?.limits.first_person_voice ?? true;

  // The same budget the Summaries tab spends, worded the same way — building
  // a recap and updating a summary both cost one unit.
  const noBudget = budget != null && budget.remaining <= 0;
  const dailyLimit = budget?.limit ?? billing?.limits.updates_per_day ?? 5;
  const remainingLabel = budget
    ? budget.remaining === 0
      ? "No updates left today"
      : `${budget.remaining} of ${budget.limit} updates left today`
    : `Up to ${dailyLimit} ${dailyLimit === 1 ? "update" : "updates"} a day`;

  const newRecapButton = (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground tabular-nums">
        {remainingLabel}
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span so the tooltip still fires when the button is disabled */}
            <span>
              {/* A disabled trigger can't open the dialog, which is the point. */}
              <NewRecapDialog projectId={projectId}>
                <Button size="sm" disabled={noBudget}>
                  New recap
                </Button>
              </NewRecapDialog>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Shared with summary updates, so building a recap uses one. The
            counter resets with your day.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  if (!canRecap) {
    return (
      <div className="border border-dashed rounded-lg p-8 text-center space-y-3">
        <Image
          src="/loggy/loggy-lock.png"
          alt="Loggy the mascot peeking over a padlock"
          width={102}
          height={140}
          className="mx-auto"
        />
        <p className="text-sm font-medium">Recaps are a Pro feature</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Roll a whole week, or a sprint, or a month, into one update you can
          paste into a review, an invoice, or a client email.
        </p>
        <div className="pt-1 flex justify-center">
          <Link href={BILLING_PATH}>
            <Button size="sm">Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  let content: React.ReactNode;

  if (isPending) {
    content = (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
    content = (
      <EmptyState
        title="No recaps yet"
        description="Pick a span of days: last week, a sprint, a month. We'll roll those daily summaries into one update."
      >
        {newRecapButton}
      </EmptyState>
    );
  } else {
    content = (
      <StaggerReveal className="space-y-3">
        {data.data.map((recap) => (
          <StaggerItem key={recap.id}>
            <RecapCard
              recap={recap}
              voice={voice}
              projectId={projectId}
              onDelete={() => setPendingDelete(recap)}
            />
          </StaggerItem>
        ))}
        <PaginationControls meta={data.meta} onPageChange={setPage} />
      </StaggerReveal>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {canSwitchVoice ? (
          <span className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Voice</span>
            <VoiceToggle value={voice} onChange={setVoice} disabled={!isReady} />
          </span>
        ) : (
          <span />
        )}
        {data && data.data.length > 0 && newRecapButton}
      </div>
      {content}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this recap?</DialogTitle>
            <DialogDescription>
              {pendingDelete &&
                `${formatSpan(day(pendingDelete.start_date), day(pendingDelete.end_date))}. The daily summaries behind it stay put, and you can rebuild the same span any time.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={remove.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                remove.mutate(pendingDelete.id, {
                  onSuccess: () => setPendingDelete(null),
                });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
