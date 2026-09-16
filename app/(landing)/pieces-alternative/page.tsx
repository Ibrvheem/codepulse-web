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

const TITLE = "A lightweight Pieces alternative, built for standups";
const DESCRIPTION =
  "Pieces remembers everything you do across your computer. WriteLogs writes up what you did in your editor, ready for standup. An honest comparison.";

/**
 * Same rule as the WakaTime page: rows describe what each tool is built
 * around, and anything about Pieces is only what pieces.app itself states.
 * No competitor prices, which go stale; the page links out instead.
 *
 * Note the data row. Pieces is on-device by default and WriteLogs syncs
 * activity metadata to its servers, so the honest pitch is a narrower scope,
 * not "more private".
 */
const ROWS: { label: string; writelogs: string; pieces: string }[] = [
  {
    label: "The question it answers",
    writelogs: "What did I do yesterday?",
    pieces: "What was I working on, anywhere?",
  },
  {
    label: "What it watches",
    writelogs: "Your coding work, from your editor",
    pieces: "Apps you focus on, your clipboard, and meeting audio if you opt in",
  },
  {
    label: "What you install",
    writelogs: "An editor extension",
    pieces: "A desktop app",
  },
  {
    label: "Where your data lives",
    writelogs: "Activity metadata synced to WriteLogs to write your summaries",
    pieces: "On your device by default",
  },
  {
    label: "Main output",
    writelogs: "A written daily log and standup update",
    pieces: "A searchable memory, with standups among its outputs",
  },
  {
    label: "In the meeting",
    writelogs: "Your update in a Google Meet side panel",
    pieces: "Lists Google Meet among its meeting integrations",
  },
  {
    label: "Editors",
    writelogs: "VS Code, Cursor, Antigravity, Devin Desktop, Kiro, VSCodium",
    pieces: "VS Code, JetBrains, Xcode, Cursor and more",
  },
  {
    label: "Getting started",
    writelogs: "Free plan, no card",
    pieces: "Paid subscription after a free trial",
  },
];

const PIECES_FITS = [
  {
    title: "You want one memory for all your work",
    body: "Research, email, chats and meetings, not just code. Pieces is built to remember all of it. WriteLogs is focused on the work you ship.",
  },
  {
    title: "You work in JetBrains or Xcode",
    body: "WriteLogs runs in VS Code and the editors built on it. If your day happens elsewhere, it cannot follow you there.",
  },
  {
    title: "Your history has to stay on your machine",
    body: "Pieces keeps what it captures on your device by default. WriteLogs sends activity metadata to its servers so it can write your summaries.",
  },
  {
    title: "You want AI assistants to search your past work",
    body: "Pieces exposes your history to tools like Claude and Cursor over MCP. WriteLogs does not.",
  },
];

const WRITELOGS_FITS = [
  {
    title: "The question is always what you did yesterday",
    body: "If standup is the reason you want a memory at all, a tool that writes that one answer well beats one that remembers everything.",
  },
  {
    title: "You would rather nothing watched your whole screen",
    body: "WriteLogs records your coding activity, like file paths, commits and what changed. It never records your screen, your clipboard or your meetings, and sensitive files like .env are never tracked at all.",
  },
  {
    title: "Your standup happens on Google Meet",
    body: "Open the WriteLogs side panel in the call and yesterday's update is already there, with a copy button for the chat.",
  },
  {
    title: "You want to try it before paying",
    body: "The free plan needs no card and keeps a week of daily logs. Pro adds full history, recaps and paste-ready standup text.",
  },
];

const FAQS: Faq[] = [
  {
    q: "Is WriteLogs a replacement for Pieces?",
    a: "Only if all you wanted from Pieces was your standup update. Pieces is a memory for everything you do on your computer; WriteLogs is deliberately narrower and exists to write up the work you ship.",
  },
  {
    q: "Does WriteLogs record my screen, clipboard or meetings?",
    a: "No. The extension sends coding activity metadata, such as file paths, branches, commits and what changed, and never your screen, clipboard or meeting audio. The privacy policy lists exactly what is collected and what never is.",
  },
  {
    q: "Does WriteLogs keep my data on my device?",
    a: "No. Activity metadata is synced to WriteLogs so your daily summaries can be written. If on-device storage is a requirement, Pieces is the better fit.",
  },
  {
    q: "Can I run both?",
    a: "Yes. WriteLogs is an editor extension and Pieces is a desktop app, and neither interferes with the other.",
  },
  {
    q: "How much does WriteLogs cost?",
    a: "There is a free plan with no card required. Pro is $8 a month, or $6 a month billed yearly.",
  },
];

export const metadata: Metadata = {
  title: "Pieces alternative",
  description: DESCRIPTION,
  alternates: { canonical: "/pieces-alternative" },
  openGraph: {
    title: "Pieces alternative for daily standups | WriteLogs",
    description: DESCRIPTION,
    url: "/pieces-alternative",
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
              Pieces
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
              <td className="py-5 align-top text-neutral-500">{row.pieces}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PiecesAlternativePage() {
  return (
    <PageShell>
      <JsonLd data={faqJsonLd(FAQS)} />

      <Hero
        eyebrow="Comparison"
        title={TITLE}
        subtitle="Pieces remembers everything you do across your computer. WriteLogs does one thing: it writes up what you did in your editor, so your standup update is ready before the call."
      />

      <Section title="Different sizes of the same idea" tone="muted">
        <Prose
          paragraphs={[
            "Pieces is an AI memory for your whole working life. A desktop app captures what you do across your apps, from research and email to code and meetings, and lets you search it, ask about it, and generate artifacts from it, including standup updates.",
            "WriteLogs starts from the other end. It starts from your editor, and it exists to answer one question well: what did you do yesterday?",
            "Both save you from reconstructing your day from memory. The difference is how much of your day they see, and what they give you back.",
          ]}
        />
      </Section>

      <Section title="Side by side">
        <ComparisonTable />
        <p className="mt-6 text-sm text-neutral-400">
          Feature sets move. The Pieces column only reflects what{" "}
          <a
            href="https://pieces.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-neutral-700 transition-colors"
          >
            pieces.app
          </a>{" "}
          says about itself, and leaves out prices, so check there for what is
          current.
        </p>
      </Section>

      <Section title="Stay with Pieces if" tone="muted">
        <RuleList items={PIECES_FITS} />
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
            meta="Your standup, written from the work itself."
          />
        </div>
      </Section>

      <Section title="Or run both" tone="muted">
        <Prose
          paragraphs={[
            "They do not collide. Pieces runs as a desktop app and WriteLogs as an editor extension, and some people want both: a memory of everything, and a standup update written for them.",
            "If you only want one, pick by the question. If it is \"where did I see that?\", Pieces. If it is \"what did you do yesterday?\", WriteLogs.",
          ]}
        />
      </Section>

      <FaqSection items={FAQS} />

      <RelatedLinks
        items={[
          {
            href: "/wakatime-alternative",
            title: "WriteLogs vs WakaTime",
            note: "Hours of coding versus a written log of what you did.",
          },
          {
            href: "/daily-standup-update",
            title: "How to write a daily standup update",
            note: "The three questions, and what a good answer sounds like.",
          },
        ]}
      />

      <ClosingCta
        title="You only need to remember one thing."
        body="Install WriteLogs, keep coding, and walk into standup with yesterday already written."
      />
    </PageShell>
  );
}
