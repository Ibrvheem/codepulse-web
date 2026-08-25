import type { Metadata } from "next";
import Link from "next/link";
import { LegalTitle, Section } from "../_components/legal";

export const metadata: Metadata = { title: "Privacy Notice — WriteLogs" };

export default function PrivacyPage() {
  return (
    <>
      <LegalTitle updated="August 25, 2026">Privacy Notice</LegalTitle>

      <Section title="1. Who we are">
        <p>
          WriteLogs turns your coding activity into daily summaries. This
          notice explains what we collect, why, and your choices. Contact:{" "}
          <a href="mailto:i.aliyu019@gmail.com">i.aliyu019@gmail.com</a>.
        </p>
      </Section>

      <Section title="2. What we collect">
        <ul>
          <li>
            <strong>Account data</strong> — your name, email address, and a
            hashed password. We never store passwords in plain text.
          </li>
          <li>
            <strong>Coding activity metadata</strong> — sent by the VS Code
            extension: file paths, programming language, branch names, commit
            hashes and messages, lines added/removed, timing (when and for how
            long you worked), and whether a change was written by you or an AI
            coding tool. Depending on your extension settings this can include
            limited code context used to improve summary accuracy.
          </li>
          <li>
            <strong>Billing data</strong> — payments are processed by Paddle,
            our merchant of record. We receive your plan and subscription
            status; we never see or store full card details.
          </li>
          <li>
            <strong>Technical data</strong> — standard server logs (IP address,
            request metadata) kept for security and debugging.
          </li>
          <li>
            <strong>Cookies and local storage</strong> — used to keep you
            signed in and remember preferences (like theme). No third-party
            advertising cookies.
          </li>
        </ul>
      </Section>

      <Section title="3. How we use it">
        <ul>
          <li>To run the Service: store your activity, show your dashboard.</li>
          <li>
            To generate summaries: your activity data is processed by an AI
            model acting as our data processor.
          </li>
          <li>To handle billing, enforce plan limits, and prevent abuse.</li>
          <li>To send transactional email (verification codes, receipts).</li>
        </ul>
        <p>We don&apos;t sell your data or use it for advertising.</p>
      </Section>

      <Section title="4. Who we share it with">
        <p>
          Only service providers that help us run WriteLogs: cloud hosting and
          database providers, Paddle (payments), our AI model provider (summary
          generation), and our email delivery provider. Each processes data
          only on our instructions.
        </p>
      </Section>

      <Section title="5. Retention and deletion">
        <p>
          We keep your data while your account exists. Deleting a project
          removes it from your view immediately; revoked API keys stop working
          the moment you revoke them. To delete your account and its data
          entirely, email us and we&apos;ll complete it within 30 days.
        </p>
      </Section>

      <Section title="6. Security">
        <p>
          Data is encrypted in transit, passwords are hashed, and API keys are
          scoped per project and revocable at any time.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>
          You can access, correct, export, or delete your data. Email{" "}
          <a href="mailto:i.aliyu019@gmail.com">i.aliyu019@gmail.com</a> and
          we&apos;ll help. Depending on where you live you may also have rights
          under laws such as the GDPR, including the right to complain to a
          supervisory authority.
        </p>
      </Section>

      <Section title="8. Children">
        <p>The Service is not directed at children under 16.</p>
      </Section>

      <Section title="9. Changes">
        <p>
          We&apos;ll update this notice as the Service evolves and note the
          date above. Material changes will be announced by email or in the
          app. See also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </Section>
    </>
  );
}
