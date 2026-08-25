import type { LogEntry } from "@/lib/types";

/**
 * Commit-anchored timeline grouping for the Activity tab.
 *
 * The same work can appear as an editor row, an agent row, AND a commit row —
 * so instead of a flat list, commits become group headers and editor/agent
 * rows nest under the next commit (by time) on the same branch that touches
 * the same file. Rows with no such commit are "uncommitted" — live work that
 * hasn't been committed yet.
 *
 * Commits arrive as one row per file sharing a commit_hash; they collapse
 * into a single group here.
 */

export type CommitGroup = {
  kind: "commit";
  key: string;
  message: string;
  shortHash: string | null;
  branch: string | null;
  /** Latest timestamp across the commit's rows. */
  time: string;
  linesAdded: number;
  linesRemoved: number;
  /** Files the commit itself touched (from its own rows). */
  fileCount: number;
  rows: LogEntry[];
};

export type UncommittedGroup = {
  kind: "uncommitted";
  branch: string | null;
  rows: LogEntry[];
};

export type DaySection = {
  /** YYYY-MM-DD in the project's timezone. */
  day: string;
  groups: CommitGroup[];
};

export type ActivityTimeline = {
  uncommitted: UncommittedGroup | null;
  days: DaySection[];
};

function rowTime(row: LogEntry): number {
  return new Date(row.ended_at ?? row.started_at).getTime();
}

export function dayKeyFor(
  iso: string,
  timezone: string | undefined,
): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
      new Date(iso),
    );
  } catch {
    return new Intl.DateTimeFormat("en-CA").format(new Date(iso));
  }
}

export function groupActivity(
  entries: LogEntry[],
  timezone: string | undefined,
): ActivityTimeline {
  const commitRows = entries.filter((e) => e.source === "commit");
  const workRows = entries.filter((e) => e.source !== "commit");

  // Collapse per-file commit rows into one group per commit hash.
  const commitsByKey = new Map<string, CommitGroup>();
  for (const row of commitRows) {
    const key = row.commit_hash ?? row.id;
    let group = commitsByKey.get(key);
    if (!group) {
      group = {
        kind: "commit",
        key,
        message: row.commit_message ?? "Commit",
        shortHash: row.commit_hash ? row.commit_hash.slice(0, 7) : null,
        branch: row.branch ?? null,
        time: row.ended_at ?? row.started_at,
        linesAdded: 0,
        linesRemoved: 0,
        fileCount: 0,
        rows: [],
      };
      commitsByKey.set(key, group);
    }
    group.linesAdded += row.lines_added;
    group.linesRemoved += row.lines_removed;
    group.fileCount += 1;
    if (rowTime(row) > new Date(group.time).getTime()) {
      group.time = row.ended_at ?? row.started_at;
    }
  }
  const commitFiles = new Map<string, Set<string>>();
  for (const row of commitRows) {
    const key = row.commit_hash ?? row.id;
    if (!commitFiles.has(key)) commitFiles.set(key, new Set());
    commitFiles.get(key)!.add(row.file_path);
  }

  // Oldest-first so "the next commit after this row" is a forward scan.
  const commits = [...commitsByKey.values()].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  const uncommittedRows: LogEntry[] = [];
  for (const row of workRows) {
    const t = rowTime(row);
    const laterSameBranch = commits.filter(
      (c) =>
        new Date(c.time).getTime() >= t &&
        (c.branch ?? null) === (row.branch ?? null),
    );
    // The earliest later commit on the same branch that touched this file.
    // No file match means the work hasn't been committed yet — editing
    // README while committing other files leaves README uncommitted.
    const target = laterSameBranch.find((c) =>
      commitFiles.get(c.key)?.has(row.file_path),
    );
    if (target) {
      target.rows.push(row);
    } else {
      uncommittedRows.push(row);
    }
  }

  for (const commit of commits) {
    commit.rows.sort((a, b) => rowTime(b) - rowTime(a));
  }
  uncommittedRows.sort((a, b) => rowTime(b) - rowTime(a));

  // Day sections (project timezone), newest first, commits newest-first within.
  const dayMap = new Map<string, CommitGroup[]>();
  for (const commit of [...commits].reverse()) {
    const day = dayKeyFor(commit.time, timezone);
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day)!.push(commit);
  }
  const days: DaySection[] = [...dayMap.entries()].map(([day, groups]) => ({
    day,
    groups,
  }));

  const uncommittedBranches = new Set(
    uncommittedRows.map((r) => r.branch ?? null),
  );
  return {
    uncommitted: uncommittedRows.length
      ? {
          kind: "uncommitted",
          branch:
            uncommittedBranches.size === 1
              ? [...uncommittedBranches][0]
              : null,
          rows: uncommittedRows,
        }
      : null,
    days,
  };
}
