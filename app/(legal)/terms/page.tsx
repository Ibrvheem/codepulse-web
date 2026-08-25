import type { Metadata } from "next";
import Link from "next/link";
import { LegalTitle, Section } from "../_components/legal";

export const metadata: Metadata = { title: "Terms of Service — WriteLogs" };

export default function TermsPage() {
  return (
    <>
      <LegalTitle updated="August 25, 2026">Terms of Service</LegalTitle>

      <Section title="1. Agreement">
        <p>
          These terms govern your use of WriteLogs — the VS Code extension, the
          web dashboard at this site, and the API behind them (together, the
          “Service”). By creating an account or using the Service you agree to
          these terms. If you don&apos;t agree, don&apos;t use the Service.
        </p>
      </Section>

      <Section title="2. Your account">
        <p>
          You need an account with a valid email address. Keep your credentials
          and API keys secret; you&apos;re responsible for activity under your
          account. You must be at least 16 years old to use the Service.
        </p>
      </Section>

      <Section title="3. What the Service does">
        <p>
          WriteLogs records metadata about your coding activity (files touched,
          branches, commits, time spent, and changes written by AI coding
          tools) and turns it into daily plain-English summaries. You keep all
          rights to your code and your data. You give us the limited license
          needed to store and process that data to provide the Service —
          including processing by an AI model to write your summaries.
        </p>
      </Section>

      <Section title="4. Plans, payment, and trials">
        <ul>
          <li>
            The free plan and Pro plan limits are described on our{" "}
            <Link href="/#pricing">pricing page</Link>. Prices are shown at
            checkout.
          </li>
          <li>
            Payments are processed by Paddle, our merchant of record. Your
            purchase is also subject to Paddle&apos;s terms.
          </li>
          <li>
            Subscriptions renew automatically until cancelled. You can cancel
            anytime from the billing page; you keep Pro until the end of the
            period you paid for.
          </li>
          <li>Trials don&apos;t require a card and end automatically.</li>
          <li>
            Refunds are handled under our{" "}
            <Link href="/refunds">Refund Policy</Link>.
          </li>
        </ul>
      </Section>

      <Section title="5. Acceptable use">
        <p>
          Don&apos;t abuse the Service: no unlawful use, no attempts to break,
          overload, or probe it, no circumventing plan limits, and no reselling
          it as your own. Only track repositories you have the right to track.
        </p>
      </Section>

      <Section title="6. Your data">
        <p>
          How we collect and handle data is described in the{" "}
          <Link href="/privacy">Privacy Notice</Link>. You can delete projects
          and revoke API keys at any time from the dashboard; deleting a
          project removes it from your view immediately. To delete your account
          and its data entirely, email us.
        </p>
      </Section>

      <Section title="7. Availability and changes">
        <p>
          WriteLogs is a young product. We may add, change, or remove features,
          and we don&apos;t promise uninterrupted availability. If we ever
          discontinue the Service, we&apos;ll give reasonable notice.
        </p>
      </Section>

      <Section title="8. Disclaimers and liability">
        <p>
          The Service is provided “as is”, without warranties of any kind.
          Summaries are AI-generated and may be inaccurate — review before you
          rely on them. To the maximum extent permitted by law, our total
          liability for any claim related to the Service is limited to the
          amount you paid us in the 12 months before the claim.
        </p>
      </Section>

      <Section title="9. Termination">
        <p>
          You can stop using the Service anytime. We may suspend or terminate
          accounts that violate these terms. Sections that by their nature
          should survive termination (like limitations of liability) survive.
        </p>
      </Section>

      <Section title="10. Changes to these terms">
        <p>
          We may update these terms. For material changes we&apos;ll notify you
          by email or in the app before they take effect. Continuing to use the
          Service after a change means you accept the new terms.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          Questions? Email{" "}
          <a href="mailto:i.aliyu019@gmail.com">i.aliyu019@gmail.com</a>.
        </p>
      </Section>
    </>
  );
}
