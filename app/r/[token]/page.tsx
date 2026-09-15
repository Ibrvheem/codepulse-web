import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AreaChips } from "@/components/area-chips";
import { recaps } from "@/lib/api-client";
import { formatSpan } from "@/lib/project-day";
import type { SharedRecap } from "@/lib/types";

async function getShared(token: string): Promise<SharedRecap | null> {
  try {
    return await recaps.shared(token);
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
  const recap = await getShared(token);
  const robots = { index: false, follow: false };
  if (!recap) return { title: "Shared recap", robots };
  return {
    robots,
    title: recap.title,
    description: recap.message,
    openGraph: { title: recap.title, description: recap.message },
    twitter: { card: "summary_large_image" },
  };
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-lg font-semibold tabular-nums">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export default async function SharedRecapPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const recap = await getShared(token);
  if (!recap) notFound();

  return (
    <div className="min-h-svh bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg border rounded-xl bg-card p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <Image src="/loggy/loggy-head.png" alt="" width={28} height={29} />
            WriteLogs
          </span>
          <span className="text-xs uppercase tracking-wide text-muted-foreground tabular-nums">
            {formatSpan(recap.start_date, recap.end_date)}
          </span>
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          {recap.title}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {recap.author_name ? `by ${recap.author_name} · ` : ""}
          {recap.days_count} {recap.days_count === 1 ? "day" : "days"} of work
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {recap.message}
        </p>

        <AreaChips areas={recap.areas} className="mt-6" />

        {recap.tasks.length > 0 && (
          <ul className="mt-6 space-y-2.5">
            {recap.tasks.map((task) => (
              <li key={task.task} className="flex items-start gap-2.5">
                <span className="mt-[7px] size-1.5 rounded-full bg-foreground/70 shrink-0" />
                <span className="min-w-0 text-sm">{task.task}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 pt-5 border-t grid grid-cols-3 gap-4">
          <Stat value={String(recap.stats.commits)} label="commits" />
          <Stat value={String(recap.stats.files)} label="files" />
          <Stat value={String(recap.stats.ai_changes)} label="changes" />
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Your work log could write itself too{" "}
        <a
          href="https://writelogs.com"
          className="text-foreground underline underline-offset-4"
        >
          writelogs.com
        </a>
      </p>
    </div>
  );
}
