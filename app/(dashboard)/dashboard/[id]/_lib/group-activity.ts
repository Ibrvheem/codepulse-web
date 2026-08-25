import type { LogEntry } from "@/lib/types";

/**
 * Commit-anchored timeline grouping for the Activity tab.
 *
 * The backend seals every editor/agent entry: `committed_in` holds the commit
 * hash that absorbed it, the literal "reconciled" when ground-truth
 * reconciliation sealed it, or null while the work is genuinely pending.
 * That field is the ONLY thing that decides "uncommitted" — never timestamps,
 * which produced false pending rows (an old entry with committed_in === null
 * is still pending; a brand-new one with a hash never is).
 *
 * Commits arrive as one row per file sharing a commit_hash; they collapse
 * into a single group. Sealed entries nest under their commit when the hash
 * matches a captured commit row; "reconciled" (or an uncaptured hash) has no
 * card to attach to and simply stays out of Uncommitted.
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
  /** Entries with no net change (reverted edits) — shown as one muted line. */
  revertedCount: number;
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
  const commitsByHash = new Map<string, CommitGroup>();
  for (const row of commitRows) {
    const key = row.commit_hash ?? row.id;
    let group = commitsByHash.get(key);
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
      commitsByHash.set(key, group);
    }
    group.linesAdded += row.lines_added;
    group.linesRemoved += row.lines_removed;
    group.fileCount += 1;
    if (rowTime(row) > new Date(group.time).getTime()) {
      group.time = row.ended_at ?? row.started_at;
    }
  }

  const uncommittedRows: LogEntry[] = [];
  let revertedCount = 0;
  for (const row of workRows) {
    const sealedBy = row.committed_in ?? null;
    if (sealedBy === null) {
      if (row.matches_head === true) {
        revertedCount += 1; // reverted edit — no net change to show
      } else {
        uncommittedRows.push(row);
      }
      continue;
    }
    // Sealed: nest under its commit when we captured that commit; otherwise
    // ("reconciled" or an uncaptured hash) it just stays out of Uncommitted.
    commitsByHash.get(sealedBy)?.rows.push(row);
  }

  for (const commit of commitsByHash.values()) {
    commit.rows.sort((a, b) => rowTime(b) - rowTime(a));
  }
  uncommittedRows.sort((a, b) => rowTime(b) - rowTime(a));

  // Day sections (project timezone), newest first, commits newest-first within.
  const commits = [...commitsByHash.values()].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
  );
  const dayMap = new Map<string, CommitGroup[]>();
  for (const commit of commits) {
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
    uncommitted:
      uncommittedRows.length || revertedCount
        ? {
            kind: "uncommitted",
            branch:
              uncommittedBranches.size === 1
                ? [...uncommittedBranches][0]
                : null,
            rows: uncommittedRows,
            revertedCount,
          }
        : null,
    days,
  };
}
