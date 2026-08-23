"use client";

import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Project } from "@/lib/types";

dayjs.extend(relativeTime);

export function ProjectCard({ project }: { project: Project }) {
  const logs = project._count?.log_entries ?? 0;
  const summaries = project._count?.summaries ?? 0;

  return (
    <Link
      href={`/dashboard/${project.id}`}
      className="group block border rounded-lg p-5 bg-card transition-all duration-200 hover:border-foreground/25 hover:-translate-y-0.5 hover:shadow-sm"
    >
      <p className="font-medium truncate">{project.name}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {project.timezone} · created {dayjs(project.created_at).fromNow()}
      </p>
      <div className="flex gap-6 mt-5 text-sm">
        <span>
          <span className="font-semibold tabular-nums">{logs}</span>{" "}
          <span className="text-muted-foreground">
            {logs === 1 ? "log" : "logs"}
          </span>
        </span>
        <span>
          <span className="font-semibold tabular-nums">{summaries}</span>{" "}
          <span className="text-muted-foreground">
            {summaries === 1 ? "summary" : "summaries"}
          </span>
        </span>
      </div>
    </Link>
  );
}
