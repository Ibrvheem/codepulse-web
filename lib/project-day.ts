/**
 * A project's day doesn't have to end at midnight: `summary_time` ("HH:mm",
 * project timezone) is when the day closes and the summary goes out. Mirrors
 * `localDay` in the API — keep the two in sync.
 */
export type DayBounds = {
  timezone?: string | null;
  summary_time?: string | null;
};

function cutoffMinutes(summaryTime: string | null | undefined): number {
  const m = /^(\d{2}):(\d{2})$/.exec(summaryTime ?? "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

/**
 * YYYY-MM-DD of the project day a timestamp falls in. Slides the clock so the
 * cutoff lands on midnight: afternoon cutoffs label the window by the day it
 * ends, morning cutoffs by the day it started.
 */
export function projectDayKey(
  date: Date | string | number,
  bounds: DayBounds | undefined,
): string {
  const cutoff = cutoffMinutes(bounds?.summary_time);
  const shift = cutoff === 0 ? 0 : cutoff < 720 ? -cutoff : 1440 - cutoff;
  const shifted = new Date(new Date(date).getTime() + shift * 60_000);
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: bounds?.timezone ?? undefined,
    }).format(shifted);
  } catch {
    return new Intl.DateTimeFormat("en-CA").format(shifted);
  }
}

/** "18:00" → "6:00 PM"; "00:00" → "Midnight". */
export function formatDayEnd(value: string | null | undefined): string {
  const v = value ?? "00:00";
  if (v === "00:00") return "Midnight";
  if (v === "12:00") return "Noon";
  const [h, m] = v.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Every half hour of the day — the only values a day can end on. */
export const DAY_END_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 48 },
  (_, i) => {
    const value = `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
    return { value, label: formatDayEnd(value) };
  },
);
