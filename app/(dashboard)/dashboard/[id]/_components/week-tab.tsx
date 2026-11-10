"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekStory } from "@/components/week/week-story";
import { ShareVideoButton } from "@/components/week/share-video-button";
import { PostToBuffer } from "./post-to-buffer";
import { personaFor } from "@/lib/week-personas";
import { shareText, weekLabel } from "@/lib/week-roast";
import type { Week } from "@/lib/types";
import { ErrorState } from "../../../_components/query-states";
import { useWeek, useWeekToken, useWeekVideo } from "../_hooks/use-week";

const MS_PER_DAY = 86_400_000;

function shiftDay(day: string, days: number): string {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

function ShareRow({ projectId, day }: { projectId: string; day?: string }) {
  const { data: week } = useWeek(projectId, day);
  const { data: video } = useWeekVideo(projectId, day);
  // Minted up front so Share can open the share sheet on the click itself.
  const { data: link } = useWeekToken(projectId, day);
  return (
    <ShareVideoButton
      video={video}
      text={week ? shareText(week, "").trim() : ""}
      link={link?.url}
      lead={
        week ? (
          <PostToBuffer
            source={{ week_project_id: projectId, week_day: week.start }}
            label="Post roast to Buffer"
            block
          />
        ) : undefined
      }
    />
  );
}

/** Before Friday: who is coming, and when. Nothing to tap. */
function Waiting({ week }: { week: Week }) {
  const persona = week.persona ?? personaFor(week.start);
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
        Your roast lands Friday afternoon, your time. Keep shipping. Or
        don&apos;t. {persona.name} will have thoughts either way.
      </p>
    </div>
  );
}

export function WeekTab({ projectId }: { projectId: string }) {
  // undefined = the latest roasted week; otherwise any day inside the wanted week.
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
  // The rendered roast is the real thing; the story player is the stand-in
  // while it renders (and for weeks rendered before videos existed).
  const { data: video } = useWeekVideo(projectId, day);

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
            // With no day picked the API shows the latest roasted week, which
            // can be behind today, so "Next" is allowed whenever a later week
            // has started.
            disabled={
              !week ||
              shiftDay(week.start, 7) > new Date().toISOString().slice(0, 10)
            }
            onClick={() => week && setDay(shiftDay(week.start, 7))}
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
      ) : video?.status === "ready" && video.url ? (
        <div className="mx-auto w-full max-w-[380px] space-y-4">
          <video
            key={video.url}
            src={video.url}
            controls
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full rounded-[2rem] bg-black shadow-2xl"
          />
          <ShareRow projectId={projectId} day={day} />
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
