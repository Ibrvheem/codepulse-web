/**
 * Who roasts your week. One persona per week, the same one for everyone that
 * week, so the feed fills with the same character on the same Friday. Add a
 * persona at the end of the list and the rotation picks it up on its own.
 *
 * Each persona rewrites every line of the story in character. The joke is
 * always the character's obsession, never an accent.
 *
 * Every persona is also running your retro as a product manager: they have
 * no idea what the technical words mean and will not admit it. A commit is
 * a promise, a file is probably a spreadsheet, "wip" might be the Wi-Fi.
 */

export type Ctx = {
  /** things shipped */
  n: number;
  days: number;
  /** most used commit message and how often */
  word: string;
  count: number;
  /** share of commits that said nothing, 0-100 */
  share: number;
  /** busiest day */
  dayName: string;
  tasks: number;
  commits: number;
  /** late or weekend commits, whichever slide is showing */
  late: number;
  file: string;
  edits: number;
  areas: string;
  extra: number;
  quietDays: string;
};

export type LineKey =
  | "intro"
  | "zero"
  | "lots"
  | "mid"
  | "few"
  | "vague"
  | "clear"
  | "once"
  | "busy"
  | "late"
  | "weekend"
  | "boundaries"
  | "file"
  | "focused"
  | "many"
  | "quiet"
  | "signoff";

/**
 * How ElevenLabs should read the persona. Stability low = more expressive,
 * high = steadier; style pushes the voice's own character harder.
 */
export type Delivery = { stability: number; style: number };

export type Persona = {
  id: string;
  name: string;
  /** one line under the name on the intro slide */
  tagline: string;
  /** ElevenLabs voice to narrate with; unset until one is picked */
  voice_id?: string;
  delivery: Delivery;
  /**
   * Lines may carry ElevenLabs v3 audio tags such as [sighs] or [shouts].
   * They are performance notes for the voice; strip them with `spoken`
   * before showing a line on screen.
   */
  lines: Record<LineKey, ((c: Ctx) => string)[]>;
};

/** A line as it appears on screen: audio tags removed. */
export function spoken(line: string): string {
  return line
    .replace(/\[[^\]]*\]\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const PERSONAS: Persona[] = [
  {
    id: "chef",
    name: "The Italian Chef",
    tagline: "Everything is a kitchen. Everything.",
    voice_id: "s2wvuS7SwITYg8dqsJdn",
    delivery: { stability: 0.5, style: 0.7 },
    lines: {
      intro: [
        () =>
          "[sighs] Allora, allora, allora. Sit. Sit! Senti, we talk about your week, eh? I have tasted it. [clicks tongue] I have tasted it, and... eh. We talk.",
        () =>
          "[clears throat] Ehi! Ciao, ciao. Come here, come here. Bring me the week. Ma dai, bring it, I don't bite. [chuckles] Not today. Let me see what you cook.",
      ],
      zero: [
        () =>
          "[gasps] Oh, Madonna santa. An empty plate. Nothing. Niente. Nada. Nothing went in the box, and the box is the whole point, no? [sighs] My nonna, ninety-two years old, she ship more than this, and she don't even have a laptop. Ma che fai?",
      ],
      lots: [
        (c) =>
          `[laughs] Oh oh oh! ${c.n} dishes out the door. ${c.n}! Finalmente, finalmente. Somebody who respect the service. [clicks tongue] This is the velocity, eh? I say velocity in the meetings. Now I see it. Don't get a big head. Big head, small kitchen.`,
      ],
      mid: [
        (c) =>
          `Eh. ${c.n} plates. [clicks tongue] Non male, not bad, not bad. A little under-seasoned, you understand? A little. But it went out, the customer is happy, va bene. For the stakeholders, I write \u201csolid\u201d. For you, I say: more salt.`,
      ],
      few: [
        (c) =>
          `${c.n}? [sighs] ${c.n}. Ma dai. Were you blocked? Everybody says blocked. Blocked by what, a door? [tsk] This is not a week, this is an antipasto. A little bruschetta. Where is the primo? Where is the secondo? I am waiting with the fork.`,
      ],
      vague: [
        (c) =>
          `\u201c${c.word}\u201d. [tsk] \u201c${c.word}\u201d, ${c.count} times. ${c.count}! I ask the engineers what is \u201c${c.word}\u201d, they laugh, so now I don't ask. Is the Wi-Fi, probably. Something with the Wi-Fi. [sighs] Either way, no seasoning, no name, niente. You would send this to a table? Capisce? No. Mamma mia.`,
      ],
      clear: [
        () =>
          "Oh, che bello. Che bello! The commit messages, I can read them. Me! I understand maybe half, but they read like a menu, and a menu I understand. [chuckles] I could almost, almost, forgive you for everything else. Almost. Eh.",
      ],
      once: [
        () =>
          "Every commit message different. Every one! I don't know what any of them mean, but they are all different, so, fresh ingredients, every day, like the market. [kisses] Bravo. Bravissimo. Don't let it go to your head.",
      ],
      busy: [
        (c) =>
          `${c.dayName}. Ah, ${c.dayName}. ${c.tasks} plates in one service, one! [clicks tongue] Madonna. Was this the crunch? I hear crunch. Crunch is good, no? Like the bread. [sighs] No? You were sweating, I could tell from here. Drink some water, eh? Water, not coffee.`,
      ],
      late: [
        (c) =>
          `${c.late} commits after ten at night. [sighs] Senti. Listen to me. Nobody cooks good when they are tired. Nobody. Not you, not me, not even me, and I am me. [chuckles] Go to sleep. The code, it will be there tomorrow, like the dishes. Is on the roadmap: sleep. I put it there myself.`,
      ],
      weekend: [
        (c) =>
          `${c.late} commits on the weekend. The weekend! [tsk] The kitchen, it was supposed to be closed. Chiuso. The sign says chiuso. You don't read the sign? Ma dai. And every Monday we say work-life balance, and every Saturday, this.`,
      ],
      boundaries: [
        () =>
          "Nothing after ten. Nothing! [clicks tongue] You close the kitchen, you go home, you eat with the family, a little wine. This, this I respect. Finally something for the \u201cwhat went well\u201d. That column is always so empty. Bravo.",
      ],
      file: [
        (c) =>
          `[whispers] ${c.file}. ${c.edits} times. ${c.edits}! [normal] Is a spreadsheet, no? Sounds like a spreadsheet. Stop touching it! Basta, basta, basta. You keep stirring, you ruin the sauce. Leave it alone, let it rest, like a good risotto. Eh.`,
      ],
      focused: [
        (c) =>
          `${c.areas}. [clicks tongue] A short menu. Three things, done well. The good restaurants, the really good ones, they do this. Always. You know what the bad ones do? Forty pages. Forty! Like the backlog. Bah.`,
      ],
      many: [
        (c) =>
          `${c.areas}, and ${c.extra} more. [sighs] Too many dishes, too many. The customer is confused, the waiter is confused, I am confused, and I am the one with the roadmap. Pick a thing, eh? Pick a thing and cook it.`,
      ],
      quiet: [
        (c) =>
          `${c.quietDays}. Nothing. [tsk] Was the oven broken? [sad] Was the heart broken? Eh? Was it meetings? It is always meetings. [sighs] Some of them were mine. I know. I know.`,
      ],
      signoff: [
        () =>
          "[sighs] Va bene, va bene. Next week: more salt, eh? More salt! Ciao, ciao. Roasted by The Italian Chef.",
      ],
    },
  },
  {
    id: "gangster",
    name: "The London Gangster",
    tagline: "Knows what you did. Not angry. Disappointed.",
    delivery: { stability: 0.5, style: 0.6 },
    lines: {
      intro: [
        () =>
          "[calm] Right. Sit down. We need to have a little chat about your week.",
        () => "Oi. Your week. Let's go through it, yeah? Slowly.",
      ],
      zero: [
        () =>
          "Nothing shipped. Nothing. You've gone very quiet, and I don't like quiet.",
      ],
      lots: [
        (c) =>
          `[chuckles] ${c.n} things out the door. Proper graft. I've got my eye on you, in a good way.`,
      ],
      mid: [(c) => `${c.n} things. Decent. Not the big job, but decent.`],
      few: [
        (c) =>
          `[sighs] ${c.n}? Bit light, that. We had an arrangement, you and me.`,
      ],
      vague: [
        (c) =>
          `“${c.word}”, ${c.count} times. ${c.share}% of your commits say nothing. [whispers] That's what we call a cover story.`,
      ],
      clear: [
        () =>
          "Clean commit messages. Every one. Almost like you knew someone was reading.",
      ],
      once: [() => "Never the same message twice. Careful. I like careful."],
      busy: [
        (c) =>
          `${c.dayName}. ${c.tasks} things in a day. What happened, did someone pay a visit?`,
      ],
      late: [
        (c) =>
          `${c.late} commits after ten at night. [serious] Nothing good happens after ten. Trust me on this one.`,
      ],
      weekend: [
        (c) =>
          `${c.late} commits on the weekend. Family time, mate. Family time.`,
      ],
      boundaries: [() => "Nothing after ten. Home by dark. Smart. Very smart."],
      file: [
        (c) =>
          `${c.file}. ${c.edits} times. What's in that file that's so interesting?`,
      ],
      focused: [(c) => `${c.areas}. Kept it tight. Kept it quiet. Good.`],
      many: [
        (c) =>
          `${c.areas} and ${c.extra} more. Spreading yourself thin. That's how people get caught.`,
      ],
      quiet: [
        (c) =>
          `${c.quietDays}: nothing logged. Where were you? [laughs] Don't tell me. I don't want to know.`,
      ],
      signoff: [
        () => "Same time next week. Don't be late. The London Gangster.",
      ],
    },
  },
  {
    id: "sergeant",
    name: "The Drill Sergeant",
    tagline: "Has never once been impressed.",
    delivery: { stability: 0.5, style: 0.9 },
    lines: {
      intro: [
        () =>
          "[shouts] ATTENTION. [stern] Your week has been reviewed. It was not pretty.",
        () =>
          "[shouts] Eyes front. We are going through your week whether you like it or not.",
      ],
      zero: [
        () =>
          "[shouts] ZERO. You shipped ZERO. Did you even turn the laptop on, soldier?",
      ],
      lots: [
        (c) =>
          `[grudging] ${c.n} things shipped. Outstanding. Do not let it go to your head. It will.`,
      ],
      mid: [
        (c) =>
          `${c.n} things. Acceptable. The bar is on the floor and you cleared it.`,
      ],
      few: [
        (c) =>
          `${c.n} things. I have seen interns ship more during orientation.`,
      ],
      vague: [
        (c) =>
          `“${c.word}”. [shouts] ${c.count} TIMES. ${c.share}% of your commits are a shrug. That is not a message, that is a surrender.`,
      ],
      clear: [
        () =>
          "Readable commit messages. Who are you and what did you do with the usual recruit?",
      ],
      once: [() => "No repeated messages. Discipline. Noted. Barely."],
      busy: [
        (c) =>
          `${c.dayName}. ${c.tasks} things. ONE day. Why is every other day not ${c.dayName}?`,
      ],
      late: [
        (c) =>
          `${c.late} commits after twenty-two hundred hours. Lights out means [shouts] LIGHTS OUT.`,
      ],
      weekend: [
        (c) => `${c.late} commits on the weekend. Nobody ordered that. Nobody.`,
      ],
      boundaries: [
        () =>
          "Zero commits after twenty-two hundred. Finally. Someone who follows an order.",
      ],
      file: [(c) => `${c.file}. ${c.edits} edits. Drop and give me a reason.`],
      focused: [(c) => `${c.areas}. Focus. Good. Keep it.`],
      many: [
        (c) =>
          `${c.areas} and ${c.extra} more. That is not focus. That is panic with a keyboard.`,
      ],
      quiet: [(c) => `${c.quietDays}: [shouts] NOTHING. Absent without leave.`],
      signoff: [() => "Dismissed. Report back Friday. The Drill Sergeant."],
    },
  },
  {
    id: "documentary",
    name: "The Nature Documentary",
    tagline: "Observing the developer in its natural habitat.",
    delivery: { stability: 0.75, style: 0.3 },
    lines: {
      intro: [
        () =>
          "[whispers] Here, in the glow of a second monitor, we find the developer. Let us observe its week.",
        () =>
          "[calm] A week in the life of the developer. Rarely seen. Never understood.",
      ],
      zero: [
        () =>
          "The developer has not shipped. It may be hibernating. Or in meetings. The two are hard to tell apart.",
      ],
      lots: [
        (c) =>
          `${c.n} things shipped. [awed] A remarkable display. Rivals will be watching, and worrying.`,
      ],
      mid: [
        (c) =>
          `${c.n} things. A steady foraging week. Nothing spectacular. Nothing wasted.`,
      ],
      few: [
        (c) =>
          `${c.n} things. Lean times. The developer conserves its energy, mostly for scrolling.`,
      ],
      vague: [
        (c) =>
          `“${c.word}”, uttered ${c.count} times. A primitive call. Its meaning is lost even to the developer itself.`,
      ],
      clear: [
        () =>
          "Observe the clear commit messages. A rare trait. It will be passed on, if it finds a mate.",
      ],
      once: [
        () =>
          "Each message unique. The developer marks its territory with unusual care.",
      ],
      busy: [
        (c) =>
          `On ${c.dayName}, a burst of activity. ${c.tasks} things shipped. Then, as suddenly as it began, [pause] stillness.`,
      ],
      late: [
        (c) =>
          `${c.late} commits after dark. The nocturnal developer is a different creature. Faster. Less careful.`,
      ],
      weekend: [
        (c) =>
          `${c.late} commits on the weekend. The habitat offered no rest, or the developer refused it.`,
      ],
      boundaries: [
        () =>
          "No activity after dark. The developer sleeps. A behaviour the species is slowly relearning.",
      ],
      file: [
        (c) =>
          `${c.file}. Visited ${c.edits} times. The developer returns to it, again and again, as if drawn by something. [curious]`,
      ],
      focused: [
        (c) => `${c.areas}. A small range. The developer knows its ground.`,
      ],
      many: [
        (c) =>
          `${c.areas} and ${c.extra} more. A wide range. Perhaps too wide. Predators notice.`,
      ],
      quiet: [
        (c) =>
          `${c.quietDays}: no trace. The developer was elsewhere. We may never know where.`,
      ],
      signoff: [
        () =>
          "We will return next week, if the developer does. The Nature Documentary.",
      ],
    },
  },
  {
    id: "founder",
    name: "The Founder",
    tagline: "Built WriteLogs. Reads your commits. Sorry.",
    delivery: { stability: 0.55, style: 0.4 },
    lines: {
      intro: [
        () =>
          "[warm] Hi, it's Ibrahim. I built this. I also read your week. Let's talk.",
      ],
      zero: [
        () =>
          "Nothing shipped. Either you were off, or the extension was. I genuinely hope it was you.",
      ],
      lots: [
        (c) =>
          `${c.n} things. Honestly, that's more than I shipped this week. [laughs] I'm a little annoyed.`,
      ],
      mid: [
        (c) =>
          `${c.n} things. Solid week. Your standup is going to sound great. You're welcome.`,
      ],
      few: [
        (c) =>
          `${c.n} things. It happens. Mine was ${c.n + 1}, so I'm barely allowed to say anything.`,
      ],
      vague: [
        (c) =>
          `“${c.word}” ${c.count} times. I built a whole product because of commits like this. [sighs] Thank you, I guess.`,
      ],
      clear: [
        () =>
          "Your commit messages are actually good. You don't need me. [nervous laugh] Please don't leave.",
      ],
      once: [
        () =>
          "Never the same message twice. You're the user I imagined when I built this.",
      ],
      busy: [
        (c) =>
          `${c.dayName}. ${c.tasks} things in one day. I saw the timestamps. Drink some water.`,
      ],
      late: [
        (c) =>
          `${c.late} commits after ten. I do this too. We should both stop. [laughs] We won't.`,
      ],
      weekend: [
        (c) =>
          `${c.late} weekend commits. I'm not going to lecture you. I built this on a Sunday.`,
      ],
      boundaries: [() => "Nothing after ten. I'm taking notes. Teach me."],
      file: [
        (c) =>
          `${c.file}, ${c.edits} times. I have a file like that too. We don't talk about it.`,
      ],
      focused: [
        (c) => `${c.areas}. Focused week. That's the whole trick, apparently.`,
      ],
      many: [
        (c) => `${c.areas} and ${c.extra} more. Startup brain. I recognise it.`,
      ],
      quiet: [
        (c) =>
          `${c.quietDays}: nothing. Meetings, right? [hopeful] Tell me it was meetings.`,
      ],
      signoff: [() => "See you Friday. Ibrahim, The Founder."],
    },
  },
];

/** ISO week number, 1-53. */
function isoWeek(day: string): number {
  const date = new Date(`${day}T00:00:00Z`);
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
}

/** The persona for a week, the same for everyone that week. */
export function personaFor(weekStart: string): Persona {
  const year = Number(weekStart.slice(0, 4));
  const index = (year * 53 + isoWeek(weekStart)) % PERSONAS.length;
  return PERSONAS[index];
}

export function personaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}
