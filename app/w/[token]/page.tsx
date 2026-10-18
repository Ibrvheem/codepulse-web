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
  const final = finalSlide(week);
  const persona = personaFor(week.start);
  const title = `${persona.name} roasted ${week.author_name || "someone"}'s week`;
  const description = `${week.shipped} shipped. ${final.lines.slice(0, 2).join(". ")}. ${weekLabel(week)}.`;
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
        <Link
          href="/"
          className="text-foreground underline underline-offset-4"
        >
          WriteLogs
        </Link>{" "}
        writes your standup, then this.
      </p>
    </div>
  );
}
