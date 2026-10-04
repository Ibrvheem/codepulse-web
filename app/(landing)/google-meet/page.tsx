import type { Metadata } from "next";

import { MEET_ADDON_URL } from "@/lib/meet-addon";
import { MEET_POSTER, MEET_VIDEO } from "@/lib/videos";
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
import { MeetVideo } from "./_components/meet-video";

const SITE = "https://www.writelogs.com";
const TITLE = "WriteLogs for Google Meet";
const DESCRIPTION =
  "A Google Meet add-on that puts your daily work log in the meeting side panel. Install it from the Workspace Marketplace, connect once, and your standup update is open before the call starts.";

/**
 * The add-on's own page. It is not at /meet: that path is the add-on's private
 * surfaces, which are noindex and framed by Meet, so the marketing page lives
 * at the slug people actually search for.
 */
const STEPS = [
  {
    title: "Install from the Workspace Marketplace",
    body: "One click, using the same Google account you use for Meet. Nothing to configure, and no admin approval needed for a personal account.",
  },
  {
    title: "Open it in a call",
    body: "In any Google Meet call, open Meeting tools, go to the Add-ons tab, and pick WriteLogs. It opens in the side panel beside the call.",
  },
  {
    title: "Connect your account once",
    body: "The first time you open the panel it asks you to connect. Press Connect, sign in, and that is the last time you think about it.",
  },
  {
    title: "Read it at standup",
    body: "From then on your latest summary is in the panel whenever you join a call: what you built, what you fixed, and the small things you would have forgotten. Switch between projects without leaving the meeting.",
  },
];

const FAQS: Faq[] = [
  {
    q: "Do I need a paid plan to use the add-on?",
    a: "No. The add-on works on the free plan. Free covers one project, the last 7 days of summaries, and a daily update.",
  },
  {
    q: "Does WriteLogs read or record my meeting?",
    a: "No. The panel only shows your own WriteLogs summary. It does not read, record or transcribe the call, and it does not see who else is in it.",
  },
  {
    q: "Can other people in the call see my panel?",
    a: "The panel opens for you, and WriteLogs never posts anything into the meeting on its own. If you want to share your update, press Copy for standup and paste it into the chat yourself.",
  },
  {
    q: "I work on more than one project. Does that work?",
    a: "Yes. The panel has a project picker, so you can switch between projects mid-call and read each one's summary without leaving the meeting.",
  },
  {
    q: "Do I still need the editor extension?",
    a: "Yes. The extension is what watches your work and writes the log; the add-on is where you read it. Setting the extension up takes about two minutes.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE}/google-meet` },
  openGraph: {
    title: `${TITLE} | WriteLogs`,
    description: DESCRIPTION,
    url: `${SITE}/google-meet`,
  },
};

export default function GoogleMeetPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "VideoObject",
              name: "WriteLogs in Google Meet",
              description: DESCRIPTION,
              thumbnailUrl: [MEET_POSTER],
              contentUrl: MEET_VIDEO,
              uploadDate: "2026-10-04",
              duration: "PT1M11S",
              publisher: { "@id": `${SITE}/#organization` },
            },
            {
              "@type": "HowTo",
              name: "How to add WriteLogs to Google Meet",
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
        eyebrow="Google Meet add-on"
        title="Your standup, already open when the call starts"
        subtitle="Add WriteLogs to Google Meet and yesterday's work is sitting in the side panel, every standup. Nothing to search for, nothing to remember."
        cta={{ href: MEET_ADDON_URL, label: "Add it to Meet", external: true }}
      />

      <MeetVideo />

      <Section title="How it works">
        <Steps items={STEPS} />
      </Section>

      <Section title="Why it is in the meeting and not another tab" tone="muted">
        <p className="text-neutral-500 leading-relaxed">
          Standup is the one moment the log has to be ready, and it is the worst
          moment to go looking for it. By the time you have found yesterday&apos;s
          branch, the person before you has finished. The panel puts the summary
          where you already are, so your turn starts with reading rather than
          remembering.
        </p>
      </Section>

      <FaqSection items={FAQS} />

      <RelatedLinks
        items={[
          {
            href: "/setup",
            title: "Set up WriteLogs",
            note: "Install the extension and create your project. About two minutes.",
          },
          {
            href: "/daily-standup-update",
            title: "Writing a daily standup update",
            note: "What a good update says, and what to leave out.",
          },
        ]}
      />

      <ClosingCta
        title="Be ready for tomorrow's standup"
        body="Set WriteLogs up today, add it to Meet, and your update is written before the call. Free plan, no credit card."
      />
    </PageShell>
  );
}
