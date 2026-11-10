import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { weeks } from "@/lib/api-client";
import { finalSlide, weekLabel } from "@/lib/week-roast";
import { personaFor } from "@/lib/week-personas";
import type { Week } from "@/lib/types";
import { WeekStory } from "@/components/week/week-story";

async function getShared(token: string): Promise<Week | null> {
  try {
    return await weeks.shared(token);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const week = await getShared(token);
  const robots = { index: false, follow: false };
  if (!week) return { title: "A week on WriteLogs", robots };
  const persona = week.persona ?? personaFor(week.start);
  const title = `${persona.name} roasted ${week.author_name || "someone"}'s week`;
  const hook = week.story?.find((b) => b.key === "hook");
  const verdict = week.story?.find((b) => b.key === "verdict");
  const description =
    hook && verdict?.score
      ? `${hook.hero}. ${verdict.score}/10: ${verdict.eyebrow}. ${weekLabel(week)}.`
      : `${week.shipped} shipped. ${finalSlide(week).lines.slice(0, 2).join(". ")}. ${weekLabel(week)}.`;
  return {
    robots,
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image" },
  };
}

export default async function SharedWeekPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const week = await getShared(token);
  if (!week) notFound();

  return (
    <div className="min-h-svh bg-background flex flex-col items-center justify-center px-4 py-12">
      <WeekStory week={week} audioBase={`/api/narrate/${token}`} />
      <p className="mt-8 max-w-xs text-center text-sm text-muted-foreground">
        Your week could roast you too.{" "}
        <Link href="/" className="text-foreground underline underline-offset-4">
          WriteLogs
        </Link>{" "}
        writes your standup, then this.
      </p>
      <p className="mt-3 max-w-xs text-center text-[11px] text-muted-foreground">
        Voice built from Google&apos;s Yoruba (SLR86) and Nigerian English
        (SLR70) speech datasets, CC BY-SA 4.0.
      </p>
    </div>
  );
}
