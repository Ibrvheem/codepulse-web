/**
 * The "your week" story. Pure functions over a Week so the dashboard player,
 * the public page and the share image all say the same thing. The lines come
 * from the week's persona (see week-personas); which variant a slide gets is
 * fixed by the week's start date, so a shared link shows the week its owner
 * laughed at, not a reshuffle.
 *
 * Deliberately no time and no AI split: the week is about what shipped.
 */
import { personaFor, spoken, type Ctx, type LineKey } from "./week-personas";
import type { Week } from "./types";

export type Slide = {
  key: string;
  /** small line above the number */
  eyebrow?: string;
  /** the big thing on the slide: a number or a short phrase */
  hero: string;
  /** the roast, one or two short lines */
  lines: string[];
  /** what the persona says on this slide, audio tags kept for the voice */
  speech: string;
};

function pick<T>(seed: string, options: T[]): T {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return options[h % options.length];
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function dayName(day: string): string {
  return DAY_NAMES[new Date(`${day}T00:00:00Z`).getUTCDay()];
}

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

function isWeekendDay(day: string): boolean {
  const dow = new Date(`${day}T00:00:00Z`).getUTCDay();
  return dow === 0 || dow === 6;
}

export function weekLabel(week: Week): string {
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  return `${fmt(week.start)} to ${fmt(week.end)}`;
}

export function slidesFor(
  week: Week,
  persona = personaFor(week.start),
): Slide[] {
  const seed = `${week.start}:${week.project_name}:${persona.id}`;
  const busiest = [...week.days].sort((a, b) => b.tasks - a.tasks)[0];
  const quiet = week.days.filter((d) => d.tasks === 0 && !isWeekendDay(d.day));
  const daysWord = week.days_active === 1 ? "day" : "days";
  const ctx: Ctx = {
    n: week.shipped,
    days: week.days_active,
    word: week.top_commit_message?.message ?? "",
    count: week.top_commit_message?.count ?? 0,
    share:
      week.commits > 0
        ? Math.round((week.vague_commits / week.commits) * 100)
        : 0,
    dayName: busiest ? dayName(busiest.day) : "",
    tasks: busiest?.tasks ?? 0,
    commits: busiest?.commits ?? 0,
    late: week.late_commits > 0 ? week.late_commits : week.weekend_commits,
    file: week.top_file ? basename(week.top_file.path) : "",
    edits: week.top_file?.edits ?? 0,
    areas: week.areas
      .slice(0, 3)
      .map((a) => a.area)
      .join(", "),
    extra: Math.max(0, week.areas.length - 3),
    quietDays: quiet.map((d) => dayName(d.day)).join(", "),
  };
  // The persona's own words for this week, when the model wrote them and
  // for this persona. Otherwise the stock bank, by slide.
  const written =
    week.roast && week.roast.persona_id === persona.id ? week.roast.lines : {};
  // Lines carry audio tags for the voice; the screen gets them stripped.
  const raw = (slideKey: string, key: LineKey) =>
    written[slideKey] ?? pick(seed + key, persona.lines[key])(ctx);
  /** One slide, read aloud as "eyebrow: hero. roast line". */
  const slide = (
    key: string,
    eyebrow: string,
    hero: string,
    line: LineKey,
    extraLine?: string,
    spokenHero = hero,
  ): Slide => {
    const text = raw(key, line);
    return {
      key,
      eyebrow,
      hero,
      lines: extraLine ? [extraLine, spoken(text)] : [spoken(text)],
      speech: `${eyebrow}: ${spokenHero}. ${text}`,
    };
  };

  const intro = raw("intro", "intro");
  const slides: Slide[] = [
    {
      key: "intro",
      eyebrow: "This week's roast by",
      hero: persona.name,
      lines: [spoken(intro)],
      speech: intro,
    },
  ];

  if (week.shipped === 0) {
    slides.push(
      slide("shipped", "Things shipped", "0", "zero", undefined, "zero"),
    );
    slides.push(finalSlide(week, persona));
    return slides;
  }

  slides.push(
    slide(
      "shipped",
      "Things shipped",
      String(week.shipped),
      week.shipped >= 20 ? "lots" : week.shipped >= 8 ? "mid" : "few",
      `Across ${week.days_active} ${daysWord}.`,
      `${week.shipped}, across ${week.days_active} ${daysWord}`,
    ),
  );

  if (week.top_commit_message) {
    const { message, count } = week.top_commit_message;
    slides.push(
      slide(
        "commit",
        "Most used commit message",
        `“${message}”`,
        count === 1 ? "once" : ctx.share >= 40 ? "vague" : "clear",
        undefined,
        message,
      ),
    );
  }

  if (busiest && busiest.tasks > 0) {
    slides.push(slide("busiest", "Your big day", dayName(busiest.day), "busy"));
  }

  if (week.late_commits > 0) {
    slides.push(
      slide("late", "Commits after 10pm", String(week.late_commits), "late"),
    );
  } else if (week.weekend_commits > 0) {
    slides.push(
      slide(
        "weekend",
        "Weekend commits",
        String(week.weekend_commits),
        "weekend",
      ),
    );
  } else {
    slides.push(
      slide(
        "boundaries",
        "Commits after 10pm",
        "0",
        "boundaries",
        undefined,
        "zero",
      ),
    );
  }

  if (week.top_file && week.top_file.edits >= 3) {
    slides.push(
      slide("file", "Favourite file", basename(week.top_file.path), "file"),
    );
  }

  if (week.areas.length > 0) {
    slides.push(
      slide(
        "areas",
        "Where the week went",
        week.areas
          .slice(0, 3)
          .map((a) => a.area)
          .join(" · "),
        week.areas.length > 3 ? "many" : "focused",
        undefined,
        ctx.areas,
      ),
    );
  }

  if (quiet.length > 0 && week.days_active > 0) {
    slides.push(slide("quiet", "Nothing shipped on", ctx.quietDays, "quiet"));
  }

  slides.push(finalSlide(week, persona));
  return slides;
}

/** The static last slide: the one people screenshot. */
export function finalSlide(
  week: Week,
  persona = personaFor(week.start),
): Slide {
  const signoff =
    (week.roast?.persona_id === persona.id && week.roast.lines.signoff) ||
    persona.lines.signoff[0]({} as Ctx);
  return {
    key: "final",
    eyebrow: weekLabel(week),
    hero: `${week.shipped} shipped`,
    lines: [
      week.top_commit_message && week.top_commit_message.count > 1
        ? `“${week.top_commit_message.message}” ×${week.top_commit_message.count}`
        : `${week.commits} commits`,
      `${week.days_active} ${week.days_active === 1 ? "day" : "days"} · ${week.files} files`,
      spoken(signoff),
    ],
    speech: `${week.shipped} shipped. ${signoff}`,
  };
}

/** Pre-filled text for the post. Short, with the roast line that stings most. */
export function shareText(week: Week, url: string): string {
  const persona = personaFor(week.start);
  const sting =
    week.top_commit_message && week.top_commit_message.count > 2
      ? `My most used commit message was “${week.top_commit_message.message}” (×${week.top_commit_message.count}).`
      : week.late_commits > 0
        ? `${week.late_commits} of my commits were after 10pm.`
        : `${week.days_active} days, ${week.commits} commits.`;
  return `I shipped ${week.shipped} things this week. ${sting} ${persona.name} roasted my week on WriteLogs: ${url}`;
}
