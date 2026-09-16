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
  Steps,
  faqJsonLd,
  type Faq,
} from "../_components/marketing";

const TITLE = "How to automate your daily standup";
const DESCRIPTION =
  "Three ways to stop reconstructing yesterday before every standup, what each one misses, and what to look for in a tool that writes the update for you.";

/**
 * Deliberately names no competitor. It targets the same searches as the
 * "automate your standup" articles other tools publish, and makes WriteLogs'
 * case through criteria any reader can check, rather than a comparison that
 * would put a bigger brand in front of them.
 */
const APPROACHES = [
  {
    title: "Script it from Git",
    body: "Run git log for everything you committed since yesterday and read it out. It costs nothing and takes a minute to set up. It also only sees what you committed, and commit messages are written for a reviewer, not for a room of people waiting for their turn.",
  },
  {
    title: "Pull it from your tracker",
    body: "Generate the update from tickets you moved in Jira or Linear. It reads well when the board is current. It is also exactly as accurate as your ticket hygiene, and most real work never gets its own ticket.",
  },
  {
    title: "Capture the work as it happens",
    body: "Let a tool record your activity through the day and write the summary for you. This is the only approach that needs nothing from you at standup time, and the one where the tool you pick matters most.",
  },
];

const CRITERIA = [
  {
    title: "Built from what changed, not what was on your screen",
    body: "Standup asks what you did. A summary of the documents you read and the chats you had is not an answer to that. Look for a tool that works from the changes in your code.",
  },
  {
    title: "It catches the code you did not type",
    body: "When an AI agent writes half the diff, the day leaves almost no trace in your memory. The tool should record those changes too, and tell you which were yours.",
  },
  {
    title: "The update is written before you ask",
    body: "If you still have to open something and generate a summary, you have moved the chore, not removed it. The update should be waiting when the call starts.",
  },
  {
    title: "It collects only what it needs",
    body: "Writing up your work does not require recording your screen, your clipboard or your meetings. Check what a tool captures before you install it, and check that secrets like .env files are never read.",
  },
  {
    title: "You can try it without a card",
    body: "You will only know whether the summaries sound like you after a week of real work. A free plan lets you find out before paying.",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Install the extension",
    body: "One extension for VS Code, Cursor, Antigravity, Devin Desktop, Kiro and VSCodium. Create a project and paste its key.",
  },
  {
    title: "Code as usual",
    body: "WriteLogs records what changes in the project, including edits from AI tools, and never reads sensitive files.",
  },
  {
    title: "Your day is written up when it ends",
    body: "At the end of your day, WriteLogs writes a short summary and the tasks behind it, and emails it to you.",
  },
  {
    title: "Read it in standup",
    body: "Open the WriteLogs side panel in Google Meet and yesterday is already there, or copy a standup-ready version into Slack.",
  },
];

const FAQS: Faq[] = [
  {
    q: "Is automating your standup update cheating?",
    a: "No. The point of standup is that your team knows what moved and what is blocked. Writing it from memory at 9:29 adds nothing except the chance of getting it wrong.",
  },
  {
    q: "Will it post updates without me seeing them?",
    a: "WriteLogs does not post anywhere. It writes your summary and you decide what to say or paste.",
  },
  {
    q: "Does WriteLogs record my screen or meetings?",
    a: "No. It records coding activity, such as file paths, commits and what changed. It never records your screen, clipboard or meeting audio, and sensitive files are never tracked.",
  },
  {
    q: "Does it work when an AI agent wrote the code?",
    a: "Yes. Changes from AI coding tools are recorded like any other change and marked as AI-written, so your summary covers the whole day.",
  },
  {
    q: "How much does it cost?",
    a: "There is a free plan with no card required. Pro is $8 a month, or $6 a month billed yearly.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/automate-daily-standup" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/automate-daily-standup",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  author: { "@type": "Organization", name: "WriteLogs" },
  publisher: { "@type": "Organization", name: "WriteLogs" },
  mainEntityOfPage: "https://www.writelogs.com/automate-daily-standup",
};

export default function AutomateDailyStandupPage() {
  return (
    <PageShell>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd(FAQS)} />

      <Hero
        eyebrow="Guide"
        title={TITLE}
        subtitle="Standup takes five minutes. Working out what you did yesterday can take longer. Here are the ways to hand that job to something else, and what each one misses."
      />

      <Section title="Why standup prep eats your morning" tone="muted">
        <Prose
          paragraphs={[
            "The meeting is short. The preparation is not, because yesterday has to be rebuilt from commit messages, closed tabs and whatever is left in your head.",
            "AI coding tools made this harder. When you review and accept a change instead of typing it, the work barely registers, so the busiest days are often the hardest to describe.",
            "Automating standup does not mean skipping it. It means the answer to what you did is already written down before anyone asks.",
          ]}
        />
      </Section>

      <Section title="Three ways to automate it">
        <Steps items={APPROACHES} />
      </Section>

      <Section title="What to look for in a tool" tone="muted">
        <RuleList items={CRITERIA} />
      </Section>

      <Section title="How WriteLogs does it">
        <Steps items={HOW_IT_WORKS} />
        <div className="mt-10">
          <SampleLog
            lines={[
              "Finished the user creation endpoint and wired it to the database insert.",
              "Replaced the retry logic in the webhook handler.",
              "Started validation on the signup form. Not finished.",
            ]}
            meta="Written from the changes themselves, before the call."
          />
        </div>
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
            href: "/wakatime-alternative",
            title: "WriteLogs vs WakaTime",
            note: "Hours of coding versus a written log of what you did.",
          },
        ]}
      />

      <ClosingCta
        title="Stop rebuilding yesterday."
        body="Install WriteLogs, keep coding, and walk into standup with your update already written."
      />
    </PageShell>
  );
}
