"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "@/components/ui/button";
import type { Creator } from "@/lib/types";
import { SCORE_DIMENSIONS } from "../../types";
import { useCreatorActions } from "../_hooks/use-creator-actions";

dayjs.extend(relativeTime);

/** The AI's read on the creator: the verdict, why WriteLogs fits, the grades. */
export function FitPanel({ creator }: { creator: Creator }) {
  const { score } = useCreatorActions(creator.id);
  const busy = score.isPending || creator.scoring;

  return (
    <section className="border rounded-lg p-4 bg-card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Fit</h2>
          {creator.scored_at && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Scored {dayjs(creator.scored_at).fromNow()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          loading={busy}
          onClick={() => score.mutate()}
        >
          {creator.score === null ? "Score" : "Re-score"}
        </Button>
      </div>

      {creator.score === null ? (
        <p className="text-sm text-muted-foreground">
          {busy
            ? "Reading their profile and posts…"
            : "Not scored yet."}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Verdict title="Why this score" body={creator.score_reason} />
            <Verdict title="Why WriteLogs" body={creator.fit_reason} />
          </div>
          {creator.score_breakdown && (
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {SCORE_DIMENSIONS.map(({ key, label }) => {
                const grade = creator.score_breakdown?.[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-3 text-xs">
                    <dt className="w-36 shrink-0 text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="flex flex-1 items-center gap-2">
                      <span className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <span
                          className="block h-full rounded-full bg-foreground/70"
                          style={{ width: `${grade * 10}%` }}
                        />
                      </span>
                      <span className="w-4 text-right tabular-nums">
                        {grade}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </>
      )}
    </section>
  );
}

function Verdict({ title, body }: { title: string; body: string | null }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <p className="text-sm mt-1 leading-relaxed break-words">{body || "–"}</p>
    </div>
  );
}
