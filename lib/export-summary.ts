/**
 * Turning a summary or a recap into a file you can keep.
 *
 * CSV opens in Excel, Numbers and Google Sheets, which is what people mean by
 * "download it as a spreadsheet". Markdown covers the "as a doc" case and
 * pastes cleanly into Notion, Linear and Jira. Both are built here rather than
 * server-side: the page already has the data, so a download costs no request
 * and no dependency.
 */

export type ExportTask = {
  task: string;
  task_first_person?: string | null;
  description: string;
  area?: string | null;
  files: string[];
  tags: string[];
  days?: string[] | null;
  /** Deliberately not exported: a model estimate, not a measurement. */
  time_minutes?: number;
};

export type ExportSource = {
  /** "2026-09-13", or "2026-09-07 to 2026-09-13" for a recap. */
  period: string;
  project: string;
  title: string;
  message: string;
  tasks: ExportTask[];
};

/**
 * Excel reads a leading =, +, - or @ as a formula, so a task starting with one
 * would execute on open. Prefixing a quote neutralises it without changing
 * what the reader sees.
 */
function csvCell(value: string | number): string {
  const text = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

// No time column: per-task minutes are a model estimate, not a measurement,
// so they are not exported.
const CSV_COLUMNS = ["Area", "Task", "Detail", "Tags", "Files", "Days"] as const;

export function toCsv(source: ExportSource): string {
  const rows = source.tasks.map((task) =>
    [
      task.area ?? "",
      task.task,
      task.description,
      task.tags.join(", "),
      task.files.join(", "),
      (task.days ?? []).join(", "),
    ]
      .map(csvCell)
      .join(","),
  );
  // BOM so Excel opens UTF-8 (and any accented path) correctly on Windows.
  return `﻿${[CSV_COLUMNS.join(","), ...rows].join("\r\n")}\r\n`;
}

export function toMarkdown(source: ExportSource): string {
  const lines = [
    `# ${source.title}`,
    "",
    `${source.project} · ${source.period}`,
    "",
    source.message,
    "",
  ];

  const groups = new Map<string, ExportTask[]>();
  for (const task of source.tasks) {
    const area = task.area?.trim() ?? "";
    groups.set(area, [...(groups.get(area) ?? []), task]);
  }
  const ordered = [...groups.entries()].sort(([a], [b]) =>
    a === "" ? 1 : b === "" ? -1 : 0,
  );

  for (const [area, tasks] of ordered) {
    if (area) lines.push(`## ${area}`, "");
    for (const task of tasks) {
      lines.push(`- ${task.task}`);
      // Collapse newlines: a wrapped description would otherwise break out of
      // the list and render as a separate paragraph.
      const detail = task.description.replace(/\s+/g, " ").trim();
      if (detail) {
        lines.push(`  - ${detail}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/** Safe, readable file name: "writelogs-api-2026-09-13.csv". */
export function exportFilename(source: ExportSource, extension: string): string {
  const slug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return `${slug(source.project)}-${slug(source.period)}.${extension}`;
}

/** Hand the file to the browser. Revoking late keeps Safari happy. */
export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(source: ExportSource) {
  downloadFile(
    exportFilename(source, "csv"),
    toCsv(source),
    "text/csv;charset=utf-8",
  );
}

export function downloadMarkdown(source: ExportSource) {
  downloadFile(
    exportFilename(source, "md"),
    toMarkdown(source),
    "text/markdown;charset=utf-8",
  );
}
