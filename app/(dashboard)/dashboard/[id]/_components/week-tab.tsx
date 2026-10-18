"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekStory } from "@/components/week/week-story";
import { ShareVideoButton } from "@/components/week/share-video-button";
import { shareText, weekLabel } from "@/lib/week-roast";
import { ErrorState } from "../../../_components/query-states";
import {
  useRenderWeekVideo,
  useShareWeek,
  useWeek,
  useWeekToken,
  useWeekVideo,
} from "../_hooks/use-week";

const MS_PER_DAY = 86_400_000;

function shiftDay(day: string, days: number): string {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

function ShareRow({ projectId, day }: { projectId: string; day?: string }) {
  const share = useShareWeek(projectId, day);
  const { data: week } = useWeek(projectId, day);
  const { data: video } = useWeekVideo(projectId, day);
  const render = useRenderWeekVideo(projectId, day);

  const copy = async () => {
    const link = await share.mutateAsync();
    try {
      await navigator.clipboard.writeText(link.url);
      toast.success("Link copied");
    } catch {
      toast.info(link.url);
    }
  };
  const post = async () => {
    const link = await share.mutateAsync();
    if (!week) return;
    const url = `https://x.com/intent/post?text=${encodeURIComponent(shareText(week, link.url))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <ShareVideoButton
        video={video}
        rendering={render.isPending}
        onRender={() => render.mutate()}
        text={week ? shareText(week, "https://writelogs.com") : ""}
        fileName={`writelogs-week-${week?.start ?? "roast"}.mp4`}
      />
      <Button
        variant="outline"
        onClick={post}
        disabled={share.isPending}
        className="flex-1"
      >
        Post link on X
      </Button>
      <Button
        variant="outline"
        onClick={copy}
        disabled={share.isPending}
        className="flex-1"
      >
        Copy link
      </Button>
    </div>
  );
}

export function WeekTab({ projectId }: { projectId: string }) {
  // undefined = this week; otherwise any day inside the wanted week.
  const [day, setDay] = useState<string | undefined>(undefined);
  const {
    data: week,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
  } = useWeek(projectId, day);
  // The voice route takes the week's share token, so it is minted up front.
  // Signed, not stored: fetching it shares nothing until the link is posted.
  const { data: link } = useWeekToken(projectId, day);

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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-medium">Your week</h2>
          <p className="text-xs text-muted-foreground">
            {week ? weekLabel(week) : " "}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!week}
            onClick={() => week && setDay(shiftDay(week.start, -7))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!week || !day}
            onClick={() => {
              if (!week) return;
              const next = shiftDay(week.start, 7);
              setDay(
                next > new Date().toISOString().slice(0, 10) ? undefined : next,
              );
            }}
          >
            Next
          </Button>
        </div>
      </div>

      {isPending ? (
        <div className="mx-auto w-full max-w-[380px]">
          <Skeleton className="aspect-[9/16] w-full rounded-[2rem]" />
        </div>
      ) : (
        <WeekStory
          key={`${week.start}:${link?.token ?? ""}`}
          week={week}
          audioBase={link ? `/api/narrate/${link.token}` : undefined}
          footer={<ShareRow projectId={projectId} day={day} />}
        />
      )}
    </div>
  );
}
