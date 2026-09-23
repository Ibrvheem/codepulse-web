import type { Metadata } from "next";

import { EditorGrid } from "@/components/editor-links";
import {
  ClosingCta,
  FaqSection,
  Hero,
  JsonLd,
  PageShell,
  RelatedLinks,
  Section,
  Steps,
  faqJsonLd,
  type Faq,
} from "../_components/marketing";
import { HOWTO_POSTER, HOWTO_VIDEO, SetupVideo } from "./_components/setup-video";

const SITE = "https://www.writelogs.com";
const TITLE = "How to set up WriteLogs";
const DESCRIPTION =
  "A one-minute walkthrough of the whole setup: install the extension, create a project, copy your key, paste it into your editor. Then your daily work log writes itself.";

/**
 * The page the setup video lives on, and the one to send anyone who signed up
 * and stopped. It is public on purpose: it should open from an email without
 * signing in, and it answers the "how do I actually start this" search.
 */
const STEPS = [
  {
    title: "Install the extension",
    body: "WriteLogs works in VS Code, Cursor, Antigravity, Devin Desktop, Kiro and VSCodium. Install it from your editor's Extensions panel, or pick your editor below.",
  },
  {
    title: "Create your project",
    body: "On your dashboard, click New project, give it a name, and choose your timezone. The timezone sets where one day ends and the next begins, so your summary lands at the right time wherever you are.",
  },
  {
    title: "Copy your key",
    body: "Open the Keys tab, create a key, and copy it. The key is what links your editor to this project.",
  },
  {
    title: "Paste it into your editor",
    body: "Open the WriteLogs sidebar in your editor, paste the key, and you're connected. That's the last thing you set up.",
  },
  {
    title: "Then just code",
    body: "WriteLogs quietly tracks what you work on, including the code your AI tools write. Every time you pause, it syncs.",
  },
  {
    title: "Read your summary",
    body: "When your workday ends, WriteLogs writes it up: what you built, what you fixed, and the small things you'd forget by morning. It's on your dashboard and in your inbox before standup.",
  },
];

const FAQS: Faq[] = [
  {
    q: "How long does setup take?",
    a: "The walkthrough above is about a minute, and doing it yourself takes about two: install the extension, create a project, copy the key, paste it in. Nothing else to configure.",
  },
  {
    q: "Do I need a credit card?",
    a: "No. The free plan is free forever and covers one project, the last 7 days of summaries, and a daily update.",
  },
  {
    q: "When does my first summary arrive?",
    a: "After your project's day ends, which you set per project in your own timezone. WriteLogs writes the summary right after that and emails it to you, so it's waiting before standup.",
  },
  {
    q: "Does it capture work done by AI tools?",
    a: "Yes. Changes made by Claude Code and other AI tools in your editor are captured along with everything you write yourself.",
  },
  {
    q: "Something isn't working. Can I get help?",
    a: "Reply to any WriteLogs email, or use the feedback board in your dashboard. A real person reads it.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE}/setup` },
  openGraph: {
    title: `${TITLE} | WriteLogs`,
    description: DESCRIPTION,
    url: `${SITE}/setup`,
  },
};

export default function SetupPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "VideoObject",
              name: "Setting up WriteLogs",
              description: DESCRIPTION,
              thumbnailUrl: [HOWTO_POSTER],
              contentUrl: HOWTO_VIDEO,
              uploadDate: "2026-09-22",
              duration: "PT1M26S",
              publisher: { "@id": `${SITE}/#organization` },
            },
            {
              "@type": "HowTo",
              name: TITLE,
              description: DESCRIPTION,
              totalTime: "PT2M",
              step: STEPS.map((step, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                name: step.title,
                text: step.body,
              })),
            },
            faqJsonLd(FAQS),
          ],
        }}
      />

      <Hero
        eyebrow="Setup"
        title="Set up WriteLogs in about two minutes"
        subtitle="Install the extension, create a project, paste your key. The walkthrough below covers all of it in about a minute."
      />

      <SetupVideo />

      <Section title="What the video covers">
        <Steps items={STEPS} />
      </Section>

      <Section title="Install for your editor" tone="muted">
        <p className="mb-10 text-neutral-500 leading-relaxed">
          One extension, every VS Code-based editor. Pick yours and it opens
          right in the Extensions panel.
        </p>
        <EditorGrid />
      </Section>

      <FaqSection items={FAQS} />

      <RelatedLinks
        items={[
          {
            href: "/daily-standup-update",
            title: "Writing a daily standup update",
            note: "What a good update says, and what to leave out.",
          },
          {
            href: "/automate-daily-standup",
            title: "How to automate your daily standup",
            note: "Three approaches, and what each one misses.",
          },
        ]}
      />

      <ClosingCta
        title="Start with today"
        body="Set it up now and tomorrow's standup is already written. Free plan, no credit card."
      />
    </PageShell>
  );
}
