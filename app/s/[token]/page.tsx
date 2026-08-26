import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { summaries } from "@/lib/api-client";
import type { SharedSummary } from "@/lib/types";

async function getShared(token: string): Promise<SharedSummary | null> {
  try {
    return await summaries.shared(token);
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
  const summary = await getShared(token);
  if (!summary) return { title: "Shared summary — WriteLogs" };
  return {
    title: `${summary.title} — WriteLogs`,
    description: summary.message,
    openGraph: { title: summary.title, description: summary.message },
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

export default async function SharedSummaryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const summary = await getShared(token);
  if (!summary) notFound();

  return (
    <div className="min-h-svh bg-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg border rounded-xl bg-card p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <Image src="/loggy/loggy-head.png" alt="" width={28} height={29} />
            WriteLogs
          </span>
          <span className="text-xs uppercase tracking-wide text-muted-foreground tabular-nums">
            {dayjs(summary.date).format("ddd, MMM D YYYY")}
          </span>
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          {summary.title}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          by {summary.author_name}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {summary.message}
        </p>

        {summary.tasks.length > 0 && (
          <ul className="mt-6 space-y-2.5">
            {summary.tasks.map((task) => (
              <li key={task.task} className="flex items-start gap-2.5">
                <span className="mt-[7px] size-1.5 rounded-full bg-foreground/70 shrink-0" />
                <span className="min-w-0 text-sm">{task.task}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 pt-5 border-t grid grid-cols-3 gap-4">
          <Stat value={String(summary.stats.commits)} label="commits" />
          <Stat value={String(summary.stats.files)} label="files" />
          <Stat value={String(summary.stats.ai_changes)} label="changes" />
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
