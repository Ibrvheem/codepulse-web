import type { Metadata } from "next";

import {
  FaqSection,
  JsonLd,
  PageShell,
  RelatedLinks,
  faqJsonLd,
  type Faq,
} from "../_components/marketing";

import { GitStandupTool } from "./_components/git-standup-tool";

const TITLE = "Turn your git log into a standup update";
const DESCRIPTION =
  "Free tool. Paste the output of git log and get a plain-English standup update you can read out or drop in Slack. No account, nothing stored.";

const FAQS: Faq[] = [
  {
    q: "What do I paste?",
    a: "The output of git log. The command on this page adds --stat so file names come along, which is how a commit called \"wip\" can still be explained. Plain git log, --oneline and --name-only work too.",
  },
  {
    q: "Is my code sent anywhere?",
    a: "No. git log --stat contains commit messages, file names and line counts, not code. The paste is sent to the WriteLogs API, summarised, and not stored.",
  },
  {
    q: "Why is the summary vague in places?",
    a: "Because commit messages are. The tool can only say what your commits say. If half of them are \"fix\", half the update is a guess from file names. The extension does not have this problem because it watches the changes themselves.",
  },
  {
    q: "What does the extension add?",
    a: "Time per task, work that never got a commit, and which changes were made by an AI tool like Claude Code. It also writes the update automatically at the end of the day, so there is nothing to paste.",
  },
  {
    q: "Is there a limit?",
    a: "A few runs per hour per person, enough to try it on a couple of days. If you want it every day, the extension's free plan does that without a limit on pasting.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/git-log-to-standup" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/git-log-to-standup",
  },
};

const toolJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Git log to standup",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description: DESCRIPTION,
  url: "https://www.writelogs.com/git-log-to-standup",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "WriteLogs" },
};

export default function GitLogToStandupPage() {
  return (
    <PageShell>
      <JsonLd data={toolJsonLd} />
      <JsonLd data={faqJsonLd(FAQS)} />

      <section className="pt-32 pb-12 lg:pt-44 lg:pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
            Free tool
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.05] tracking-[-0.035em]">
            {TITLE}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            Paste what git log prints. Get three sentences you can say out loud
            at 9:30. No account, nothing stored.
          </p>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <GitStandupTool />
        </div>
      </section>

      <FaqSection items={FAQS} />

      <RelatedLinks
        items={[
          {
            href: "/automate-daily-standup",
            title: "How to automate your daily standup",
            note: "Three ways to stop rebuilding yesterday, and what each misses.",
          },
          {
            href: "/daily-standup-update",
            title: "How to write a daily standup update",
            note: "The three questions, and what a good answer sounds like.",
          },
        ]}
      />

    </PageShell>
  );
}
