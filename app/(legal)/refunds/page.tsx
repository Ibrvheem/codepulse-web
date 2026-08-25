import type { Metadata } from "next";
import Link from "next/link";
import { LegalTitle, Section } from "../_components/legal";

export const metadata: Metadata = { title: "Refund Policy — WriteLogs" };

export default function RefundsPage() {
  return (
    <>
      <LegalTitle updated="August 25, 2026">Refund Policy</LegalTitle>

      <Section title="The short version">
        <p>
          If Pro isn&apos;t working out within the first 14 days of your first
          purchase, we&apos;ll refund you. No forms, no hoops — just email us.
        </p>
      </Section>

      <Section title="First purchase — 14-day guarantee">
        <p>
          If you&apos;re not satisfied, email{" "}
          <a href="mailto:i.aliyu019@gmail.com">i.aliyu019@gmail.com</a> from
          your account email within 14 days of your first Pro payment and
          we&apos;ll issue a full refund.
        </p>
      </Section>

      <Section title="Renewals">
        <p>
          Subscriptions renew automatically. If you were charged for a renewal
          you didn&apos;t intend, contact us within 14 days of the charge and
          we&apos;ll make it right — accidental renewals are refunded.
        </p>
      </Section>

      <Section title="Cancelling">
        <p>
          You can cancel anytime from the billing page (Manage subscription).
          Cancelling stops future charges; you keep Pro until the end of the
          period you already paid for. Trials never charge a card.
        </p>
      </Section>

      <Section title="How refunds are paid">
        <p>
          Payments are processed by Paddle, our merchant of record, and refunds
          go back to your original payment method — typically within 5–10
          business days of approval.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          Anything unclear, email{" "}
          <a href="mailto:i.aliyu019@gmail.com">i.aliyu019@gmail.com</a>. See
          also the <Link href="/terms">Terms of Service</Link>.
        </p>
      </Section>
    </>
  );
}
