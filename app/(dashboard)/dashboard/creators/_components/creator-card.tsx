"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Creator } from "@/lib/types";
import { useMoveCreator } from "../_hooks/use-move-creator";
import { CREATORS_PATH, platformLabel } from "../types";
import { ScoreBadge } from "./score-badge";
import { StageBadge } from "./stage-badge";
import { StageSelect } from "./stage-select";

const compact = new Intl.NumberFormat("en", { notation: "compact" });

/** "@ada · DEV · 1.8K followers", skipping what the source didn't give us. */
export function CreatorByline({ creator }: { creator: Creator }) {
  return (
    <p className="text-xs text-muted-foreground truncate">
      @{creator.username} · {platformLabel(creator.platform)}
      {creator.followers !== null &&
        ` · ${compact.format(creator.followers)} followers`}
    </p>
  );
}

export function CreatorCard({
  creator,
  actions,
}: {
  creator: Creator;
  /** "stage": move anywhere. "triage": the two calls a new prospect needs. */
  actions: "stage" | "triage";
}) {
  return (
    <div className="relative h-full border rounded-lg p-4 bg-card flex gap-4 transition-all duration-200 hover:border-foreground/25 hover:-translate-y-0.5 hover:shadow-sm">
      <ScoreBadge score={creator.score} scoring={creator.scoring} />

      <div className="min-w-0 flex-1">
        <Link
          href={`${CREATORS_PATH}/${creator.id}`}
          className="block outline-none focus-visible:underline"
        >
          {/* Stretch the click target over the whole card; the controls sit
              above it on their own z-index. */}
          <span className="absolute inset-0 rounded-lg" aria-hidden />
          <p className="font-medium leading-snug truncate">{creator.name}</p>
        </Link>
        <CreatorByline creator={creator} />
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 break-words">
          {creator.score_reason ??
            (creator.scoring
              ? "Scoring this one…"
              : creator.bio || "Not scored yet.")}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {actions === "triage" ? (
            <TriageButtons creator={creator} />
          ) : (
            <div className="relative z-10">
              <StageSelect creator={creator} />
            </div>
          )}
          {creator.current_project && (
            <span className="text-xs text-muted-foreground truncate max-w-48">
              Building: {creator.current_project}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TriageButtons({ creator }: { creator: Creator }) {
  const move = useMoveCreator(creator.id);
  if (creator.status !== "DISCOVERED") {
    return <StageBadge status={creator.status} />;
  }
  return (
    <div className="relative z-10 flex gap-2">
      <Button
        size="xs"
        loading={move.isPending && move.variables === "SHORTLISTED"}
        disabled={move.isPending}
        onClick={() => move.mutate("SHORTLISTED")}
      >
        Shortlist
      </Button>
      <Button
        size="xs"
        variant="ghost"
        className="text-muted-foreground"
        disabled={move.isPending}
        onClick={() => move.mutate("REJECTED")}
      >
        Reject
      </Button>
    </div>
  );
}
