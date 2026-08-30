import type { LogEntry } from "@/lib/types";
import { projectDayKey, type DayBounds } from "@/lib/project-day";

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
  /** Root folder name of the repo the commit was made in (null on old clients). */
  repo: string | null;
  /** Latest timestamp across the commit's rows. */
  time: string;
  linesAdded: number;
  linesRemoved: number;
  /** Distinct files the commit touched (its `files` list, or one per row on old data). */
  fileCount: number;
  rows: LogEntry[];
};

export type UncommittedGroup = {
  kind: "uncommitted";
  branch: string | null;
  /** The single repo every pending row belongs to, or null when they span several. */
  repo: string | null;
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
  /** Distinct repo names seen — >1 means rows need a repo prefix to be unambiguous. */
  repoCount: number;
};

/** One value if every row agrees on it, else null. */
function single<T>(values: (T | null)[]): T | null {
  const set = new Set(values);
  return set.size === 1 ? [...set][0] : null;
}

function rowTime(row: LogEntry): number {
  return new Date(row.ended_at ?? row.started_at).getTime();
}

/** YYYY-MM-DD of the project day (timezone + day-end time) an ISO time falls in. */
export function dayKeyFor(iso: string, bounds: DayBounds | undefined): string {
  return projectDayKey(iso, bounds);
}

export function groupActivity(
  entries: LogEntry[],
  bounds: DayBounds | undefined,
): ActivityTimeline {
  const commitRows = entries.filter((e) => e.source === "commit");
  const workRows = entries.filter((e) => e.source !== "commit");

  // Collapse per-file commit rows into one group per commit hash. A commit is
  // normally ONE row carrying `files`; older clients sent one row per file.
  const commitsByHash = new Map<string, CommitGroup>();
  const commitFiles = new Map<string, Set<string>>();
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
        repo: row.repo_name ?? null,
        time: row.ended_at ?? row.started_at,
        linesAdded: 0,
        linesRemoved: 0,
        fileCount: 0,
        rows: [],
      };
      commitsByHash.set(key, group);
    }
    group.repo ??= row.repo_name ?? null;
    group.linesAdded += row.lines_added;
    group.linesRemoved += row.lines_removed;
    const files = commitFiles.get(key) ?? new Set<string>();
    for (const f of row.files?.length ? row.files : [row.file_path]) files.add(f);
    commitFiles.set(key, files);
    group.fileCount = files.size;
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
    const day = dayKeyFor(commit.time, bounds);
    if (!dayMap.has(day)) dayMap.set(day, []);
    dayMap.get(day)!.push(commit);
  }
  const days: DaySection[] = [...dayMap.entries()].map(([day, groups]) => ({
    day,
    groups,
  }));

  const repoNames = new Set(
    entries.map((e) => e.repo_name).filter((r): r is string => !!r),
  );
  return {
    uncommitted:
      uncommittedRows.length || revertedCount
        ? {
            kind: "uncommitted",
            branch: single(uncommittedRows.map((r) => r.branch ?? null)),
            repo: single(uncommittedRows.map((r) => r.repo_name ?? null)),
            rows: uncommittedRows,
            revertedCount,
          }
        : null,
    days,
    repoCount: repoNames.size,
  };
}
