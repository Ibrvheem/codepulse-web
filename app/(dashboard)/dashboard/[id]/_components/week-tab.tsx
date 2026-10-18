"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekStory } from "@/components/week/week-story";
import { ShareVideoButton } from "@/components/week/share-video-button";
import { personaFor } from "@/lib/week-personas";
import { shareText, weekLabel } from "@/lib/week-roast";
import type { Week } from "@/lib/types";
import { ErrorState } from "../../../_components/query-states";
import {
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

  const copy = async () => {
    const link = await share.mutateAsync();
    try {
      await navigator.clipboard.writeText(link.url);
      toast.success("Link copied");
    } catch {
      toast.info(link.url);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <ShareVideoButton
        video={video}
        text={week ? shareText(week, "https://writelogs.com") : ""}
        fileName={`writelogs-week-${week?.start ?? "roast"}.mp4`}
      />
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

/** Before Friday: who is coming, and when. Nothing to tap. */
function Waiting({ week }: { week: Week }) {
  const persona = personaFor(week.start);
  return (
    <div className="mx-auto flex w-full max-w-[380px] flex-col items-center rounded-[2rem] border border-dashed px-8 py-16 text-center">
      <Image
        src="/loggy/loggy-tired.png"
        alt=""
        width={96}
        height={96}
        className="mb-6"
      />
      <p className="font-medium">{persona.name} is still watching.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Your roast lands Friday at 5pm, your time. Keep shipping. Or don&apos;t.{" "}
        {persona.name.replace("The ", "The ")} will have thoughts either way.
      </p>
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
      ) : !week.roast ? (
        <Waiting week={week} />
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
