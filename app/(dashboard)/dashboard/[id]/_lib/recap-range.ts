import { projectDayKey, type DayBounds } from "@/lib/project-day";

export { formatSpan } from "@/lib/project-day";

/** An inclusive span of project days, both ends "YYYY-MM-DD". */
export type RecapRange = { start: string; end: string };

/** Move a project-day key n days (day keys are plain calendar days, no TZ). */
export function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Length of an inclusive span in days; 0 if the end precedes the start. */
export function spanDays({ start, end }: RecapRange): number {
  const ms =
    Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`);
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.round(ms / 86_400_000) + 1;
}

/**
 * The spans people actually ask for, anchored on the project's own today
 * (its timezone and day-end time), never the browser's. Weeks start Monday.
 */
export function recapPresets(
  bounds: DayBounds | undefined,
): { key: string; label: string; range: RecapRange }[] {
  const today = projectDayKey(Date.now(), bounds);
  // Monday-based offset: Mon → 0, Sun → 6.
  const sinceMonday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const thisMonday = shiftDay(today, -sinceMonday);
  const lastMonday = shiftDay(thisMonday, -7);

  return [
    { key: "this-week", label: "This week", range: { start: thisMonday, end: today } },
    {
      key: "last-week",
      label: "Last week",
      range: { start: lastMonday, end: shiftDay(lastMonday, 6) },
    },
    {
      key: "last-7",
      label: "Last 7 days",
      range: { start: shiftDay(today, -6), end: today },
    },
    {
      key: "last-30",
      label: "Last 30 days",
      range: { start: shiftDay(today, -29), end: today },
    },
  ];
}
