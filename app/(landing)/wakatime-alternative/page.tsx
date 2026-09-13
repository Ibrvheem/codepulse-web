import type { Metadata } from "next";

import {
  ClosingCta,
  FaqSection,
  Hero,
  JsonLd,
  PageShell,
  Prose,
  RelatedLinks,
  RuleList,
  SampleLog,
  Section,
  faqJsonLd,
  type Faq,
} from "../_components/marketing";

const TITLE = "A WakaTime alternative that writes your work log";
const DESCRIPTION =
  "WakaTime measures how long you coded. WriteLogs writes what you actually did. An honest comparison of two tools that solve different problems.";

/**
 * Comparison rows describe each tool's design intent rather than claiming a
 * competitor is missing features. WakaTime's feature set changes; the page
 * says so and links out rather than quoting prices that go stale.
 */
const ROWS: { label: string; writelogs: string; wakatime: string }[] = [
  {
    label: "The question it answers",
    writelogs: "What did I do?",
    wakatime: "How long did I code?",
  },
  {
    label: "What it records",
    writelogs: "What changed in the project",
    wakatime: "Time spent, from editor activity",
  },
  {
    label: "Main output",
    writelogs: "A written daily log",
    wakatime: "Dashboards and charts",
  },
  {
    label: "Built for",
    writelogs: "Standup, status updates, reviews",
    wakatime: "Time analytics, goals, leaderboards",
  },
  {
    label: "Time per language and editor",
    writelogs: "Not tracked",
    wakatime: "Core feature",
  },
  {
    label: "Paste-ready standup text",
    writelogs: "Yes, on Pro",
    wakatime: "Not what it is for",
  },
  {
    label: "A week or month as one write-up",
    writelogs: "Recaps, on Pro",
    wakatime: "Charts for the range",
  },
];

const WAKATIME_FITS = [
  {
    title: "You need to bill hours",
    body: "Contract and agency work needs defensible numbers per project. A written log is not an invoice.",
  },
  {
    title: "You want the language and editor breakdown",
    body: "Time split by language, file and editor is WakaTime's core, and WriteLogs does not measure any of it.",
  },
  {
    title: "You are motivated by goals and streaks",
    body: "Daily targets and leaderboards are a genuine reason people keep a tracker installed. WriteLogs has nothing of the kind.",
  },
];

const WRITELOGS_FITS = [
  {
    title: "You have to speak in standup tomorrow",
    body: "A number of hours does not help you at half past nine. A sentence about what you finished does.",
  },
  {
    title: "Most of your code is now AI-assisted",
    body: "When you review and accept rather than type, the day leaves almost no trace in your memory. WriteLogs records what changed regardless of who wrote it.",
  },
  {
    title: "You need to remember a whole quarter",
    body: "Performance reviews and weekly summaries need what you shipped, not how many hours the editor was open.",
  },
];

const FAQS: Faq[] = [
  {
    q: "Is WriteLogs a drop-in replacement for WakaTime?",
    a: "No, and it does not try to be. WakaTime measures time; WriteLogs describes work. If what you need is hours per language, WakaTime is the right tool and WriteLogs will disappoint you.",
  },
  {
    q: "Can I run both at the same time?",
    a: "Yes. They are separate extensions doing separate jobs, and nothing about one interferes with the other.",
  },
  {
    q: "Does WriteLogs track how long I spent coding?",
    a: "It notices when you are working and when you have stepped away so it knows which work belongs to which day. It does not present time as a metric, and there is no per-language breakdown.",
  },
  {
    q: "Which editors does WriteLogs support?",
    a: "VS Code, Cursor, Antigravity, Devin Desktop, Kiro and VSCodium, all from one extension.",
  },
];

export const metadata: Metadata = {
  title: "WakaTime alternative — WriteLogs",
  description: DESCRIPTION,
  alternates: { canonical: "/wakatime-alternative" },
  openGraph: {
    title: "WakaTime alternative — WriteLogs",
    description: DESCRIPTION,
    url: "/wakatime-alternative",
  },
};

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-300">
            <th className="py-4 pr-4 text-sm font-medium text-neutral-400" />
            <th className="py-4 pr-4 text-sm font-semibold text-neutral-900">
              WriteLogs
            </th>
            <th className="py-4 text-sm font-semibold text-neutral-500">
              WakaTime
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-neutral-200">
              <th
                scope="row"
                className="py-5 pr-4 align-top text-sm font-normal text-neutral-400"
              >
                {row.label}
              </th>
              <td className="py-5 pr-4 align-top text-neutral-900">
                {row.writelogs}
              </td>
              <td className="py-5 align-top text-neutral-500">{row.wakatime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WakatimeAlternativePage() {
  return (
    <PageShell>
      <JsonLd data={faqJsonLd(FAQS)} />

      <Hero
        eyebrow="Comparison"
        title={TITLE}
        subtitle="WakaTime tells you how long you spent. WriteLogs tells you what you did. Both are useful, and which one you want depends entirely on the question you are being asked."
      />

      <Section title="They are not really competitors" tone="muted">
        <Prose
          paragraphs={[
            "WakaTime is a time tracker for programmers, and a well-established one. It watches editor activity and turns it into hours, split by project, language, file and editor, with dashboards, goals and leaderboards on top. If the question you need answered is how long, it answers it.",
            "WriteLogs answers a different question. It watches what changes in the project and writes the day up in sentences, so you have something to say in standup rather than a number to report.",
            "People end up comparing them because both install as an editor extension and both promise to remember your day. They remember completely different things about it.",
          ]}
        />
      </Section>

      <Section title="Side by side">
        <ComparisonTable />
        <p className="mt-6 text-sm text-neutral-400">
          Feature sets move. This describes what each tool is built around
          rather than quoting prices or plan limits, so check{" "}
          <a
            href="https://wakatime.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-neutral-700 transition-colors"
          >
            wakatime.com
          </a>{" "}
          for what is current on their side.
        </p>
      </Section>

      <Section title="Stay with WakaTime if" tone="muted">
        <RuleList items={WAKATIME_FITS} />
      </Section>

      <Section title="Try WriteLogs if">
        <RuleList items={WRITELOGS_FITS} />
        <div className="mt-10">
          <SampleLog
            lines={[
              "Finished the user creation endpoint and wired it to the database insert.",
              "Replaced the retry logic in the webhook handler.",
              "Started validation on the signup form. Not finished.",
            ]}
            meta="This is the output. No hours, no charts."
          />
        </div>
      </Section>

      <Section title="Or run both" tone="muted">
        <Prose
          paragraphs={[
            "There is no conflict. They are separate extensions watching for separate things, and plenty of people want the hours for invoicing and the sentences for standup.",
            "If you only want one, pick by who is asking. A client asking what they are paying for wants WakaTime. A team asking what you did yesterday wants WriteLogs.",
          ]}
        />
      </Section>

      <FaqSection items={FAQS} />

      <RelatedLinks
        items={[
          {
            href: "/daily-standup-update",
            title: "How to write a daily standup update",
            note: "The three questions, and what a good answer sounds like.",
          },
          {
            href: "/for/vscode",
            title: "WriteLogs for VS Code",
            note: "Automatic daily logs, no timers or forms.",
          },
        ]}
      />

      <ClosingCta
        title="Hours are not an answer."
        body="Install WriteLogs, keep coding, and read your day back in sentences you can actually say out loud."
      />
    </PageShell>
  );
}
