import type { Metadata } from "next";
import Link from "next/link";
import { LegalTitle, Section } from "../_components/legal";

export const metadata: Metadata = {
  title: "Support — WriteLogs",
  description:
    "Get help with WriteLogs: the editor extension, daily summaries, the Google Meet panel, and billing.",
  alternates: { canonical: "/support" },
};

const EMAIL = "i.aliyu019@gmail.com";

export default function SupportPage() {
  return (
    <>
      <LegalTitle subtitle="Something not working, or not sure how a part of WriteLogs is meant to behave? Here's how to reach us.">
        Support
      </LegalTitle>

      <Section title="Email us">
        <p>
          Write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We usually reply
          within one business day.
        </p>
        <p>To get a useful answer on the first reply, include:</p>
        <ul>
          <li>the email address on your WriteLogs account</li>
          <li>the project name, if it concerns one project</li>
          <li>your editor and the WriteLogs extension version</li>
          <li>what you expected to happen, and what happened instead</li>
        </ul>
      </Section>

      <Section title="Common things">
        <p>
          <strong>No summary appeared.</strong> Summaries are written when your
          project day ends, so a day with no tracked coding produces nothing.
          Check that the extension shows Tracking in your editor and that the
          day end time in project settings is what you expect.
        </p>
        <p>
          <strong>The extension isn&apos;t tracking.</strong> Open the WriteLogs
          panel in your editor and confirm it&apos;s connected with a valid
          project key. Keys are per project and can be regenerated from the Keys
          tab.
        </p>
        <p>
          <strong>The Google Meet panel asks you to connect.</strong> Press
          Connect and sign in to WriteLogs in the window that opens. The panel
          keeps its own session, so signing out of the dashboard elsewhere can
          send it back to that screen.
        </p>
        <p>
          <strong>Billing, plans and refunds.</strong> Manage your subscription
          from the billing page in your dashboard. Our{" "}
          <Link href="/refunds">refund policy</Link> covers the 14 day
          guarantee and renewals.
        </p>
      </Section>

      <Section title="Bugs and feature requests">
        <p>
          Signed-in users can post to the feedback board from the dashboard, see
          what others have asked for, and vote. It&apos;s the fastest way to get
          something on the roadmap. Anything sensitive, email us instead.
        </p>
      </Section>

      <Section title="Account and data">
        <p>
          To export or delete your data, or ask what we store, email{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. The{" "}
          <Link href="/privacy">privacy policy</Link> covers what WriteLogs
          collects and why.
        </p>
      </Section>
    </>
  );
}
