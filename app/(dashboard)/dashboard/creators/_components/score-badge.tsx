import { Loader2 } from "lucide-react";

/** Matches the API's HIGH_FIT_SCORE; below 40 isn't worth a message. */
function tone(score: number) {
  if (score >= 70) return "text-win bg-win/10 border-win/20";
  if (score >= 40) return "text-gold bg-gold/10 border-gold/20";
  return "text-muted-foreground bg-muted border-border";
}

/** The 0-100 fit score as a square tile. A dash until scored. */
export function ScoreBadge({
  score,
  scoring = false,
  size = "sm",
}: {
  score: number | null;
  scoring?: boolean;
  size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "size-14 text-xl" : "size-11 text-base";
  return (
    <span
      className={`shrink-0 rounded-md border font-semibold tabular-nums flex items-center justify-center ${box} ${
        score === null ? "text-muted-foreground bg-muted border-border" : tone(score)
      }`}
      aria-label={
        score === null
          ? scoring
            ? "Scoring"
            : "Not scored yet"
          : `Fit score ${score} out of 100`
      }
    >
      {score !== null ? (
        score
      ) : scoring ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        "–"
      )}
    </span>
  );
}
