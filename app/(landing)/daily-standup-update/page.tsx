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
  Section,
  faqJsonLd,
  type Faq,
} from "../_components/marketing";

const TITLE = "How to write a daily standup update";
const DESCRIPTION =
  "The three questions, what a good standup update actually sounds like, and what to say on the mornings you cannot remember what you did.";

const RULES = [
  {
    title: "Name the thing",
    body: "“The API” is not a thing. “The user creation endpoint” is. If a teammate cannot picture what you touched, the sentence has not landed.",
  },
  {
    title: "Say what state it is in",
    body: "Started, finished, in review, blocked. Your team is listening for status, not activity. “I worked on it” tells them nothing they can act on.",
  },
  {
    title: "Lead with the blocker",
    body: "If you are stuck, that is the only part of your update the room needs. Say it first, before anyone has stopped listening.",
  },
  {
    title: "Keep it under thirty seconds",
    body: "Standup is a queue. Everything you say costs everyone else their turn. Detail belongs in the thread afterwards, not in the meeting.",
  },
  {
    title: "Do not perform",
    body: "Nobody is scoring you on volume. A quiet day described accurately is worth more to your team than a busy day described vaguely.",
  },
];

const FAQS: Faq[] = [
  {
    q: "What if I did not finish anything yesterday?",
    a: "Say what moved and what you learned. “I spent yesterday tracing why the webhook retries, found it is the timeout, fixing it today” is a complete and useful update.",
  },
  {
    q: "How long should a daily standup update be?",
    a: "About thirty seconds. Three sentences is usually enough: what you finished, what you are on now, and anything blocking you.",
  },
  {
    q: "Should I mention a blocker I already solved?",
    a: "Only if it cost real time or is likely to hit someone else. Otherwise it is history, and history belongs in the log rather than the meeting.",
  },
  {
    q: "What if I genuinely cannot remember what I did?",
    a: "Do not reconstruct it from commit messages while everyone waits. Keep a running log instead, so the answer already exists by the time you are asked.",
  },
];

export const metadata: Metadata = {
  title: `${TITLE} (with examples)`,
  description: DESCRIPTION,
  alternates: { canonical: "/daily-standup-update" },
  openGraph: {
    title: `${TITLE} (with examples)`,
    description: DESCRIPTION,
    url: "/daily-standup-update",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  author: { "@type": "Organization", name: "WriteLogs" },
  publisher: { "@type": "Organization", name: "WriteLogs" },
  mainEntityOfPage: "https://www.writelogs.com/daily-standup-update",
};

function ExampleCard({
  label,
  verdict,
  quote,
  reason,
  tone,
}: {
  label: string;
  verdict: string;
  quote: string;
  reason: string;
  tone: "weak" | "strong";
}) {
  const strong = tone === "strong";
  return (
    <div
      className={`min-w-0 rounded-2xl border p-6 ${
        strong
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={`text-xs font-medium uppercase tracking-[0.14em] ${
            strong ? "text-neutral-400" : "text-neutral-400"
          }`}
        >
          {label}
        </p>
        <p className={`text-xs ${strong ? "text-neutral-400" : "text-neutral-400"}`}>
          {verdict}
        </p>
      </div>
      <p
        className={`mt-4 text-lg leading-relaxed ${
          strong ? "text-white" : "text-neutral-700"
        }`}
      >
        {quote}
      </p>
      <p
        className={`mt-5 pt-4 border-t text-sm leading-relaxed ${
          strong
            ? "border-neutral-700 text-neutral-300"
            : "border-neutral-100 text-neutral-500"
        }`}
      >
        {reason}
      </p>
    </div>
  );
}

export default function DailyStandupUpdatePage() {
  return (
    <PageShell>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd(FAQS)} />

      <Hero
        eyebrow="Guide"
        title={TITLE}
        subtitle="Three questions, thirty seconds, and no performance. Here is the format, what a good answer sounds like, and what to do on the mornings you draw a blank."
      />

      <Section title="The three questions" tone="muted">
        <Prose
          paragraphs={[
            "Almost every standup, whatever the team calls it, is asking the same three things: what did you finish, what are you on now, and is anything in your way.",
            "The first question is about yesterday, and it is the one people answer worst. It wants outcomes, not hours. What is different about the codebase now that was not different this time yesterday?",
            "The second is about today, and it is a commitment, not a wish list. Name the one thing you expect to have finished by tomorrow morning.",
            "The third is the only one that changes anyone else's day. If nothing is blocking you, say so in two words and give the time back.",
          ]}
        />
      </Section>

      <Section title="What the difference sounds like">
        <div className="grid gap-4 md:grid-cols-2">
          <ExampleCard
            tone="weak"
            label="Weak"
            verdict="No information"
            quote="Yesterday I worked on the API. Today I'll keep going on that. No blockers."
            reason="Three sentences, nothing in them. Nobody knows what shipped, what is left, or whether to worry. It is the update you give when you cannot remember the day."
          />
          <ExampleCard
            tone="strong"
            label="Strong"
            verdict="Same length"
            quote="Yesterday I finished the user creation endpoint and it returns the created record. Today I'm adding validation and tests. I'm blocked on staging database credentials."
            reason="Specific, states where each piece stands, and ends on the thing someone else can unblock. No longer than the weak one."
          />
        </div>
      </Section>

      <Section title="Five rules that make it better" tone="muted">
        <RuleList items={RULES} />
      </Section>

      <Section title="The format is not the hard part">
        <Prose
          paragraphs={[
            "Nobody freezes in standup because they do not know the three questions. They freeze because yesterday has genuinely gone.",
            "This has got worse, not better. When a model writes half your code, you reviewed and accepted the work rather than typing it, and accepted work does not stick in memory the way typed work does.",
            "So people reconstruct. They scroll their commit history while the call waits, and read out messages written for a code reviewer, which is why so many updates sound like a changelog nobody asked for.",
            "The fix is not a better format. It is having the answer already written down before anyone asks.",
          ]}
        />
      </Section>

      <FaqSection items={FAQS} />

      <RelatedLinks
        items={[
          {
            href: "/for/vscode",
            title: "WriteLogs for VS Code",
            note: "Automatic daily logs, no timers or forms.",
          },
          {
            href: "/for/cursor",
            title: "WriteLogs for Cursor",
            note: "Logs that include the code you did not type.",
          },
        ]}
      />

      <ClosingCta
        title="Have the answer before they ask."
        body="WriteLogs watches what you change and writes your day up for you, so standup is reading rather than remembering."
      />
    </PageShell>
  );
}
