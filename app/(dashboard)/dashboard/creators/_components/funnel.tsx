import type { CreatorOverview } from "@/lib/types";

const STEPS: { key: keyof CreatorOverview["funnel"]; label: string }[] = [
  { key: "discovered", label: "Discovered" },
  { key: "high_fit", label: "High fit" },
  { key: "contacted", label: "Contacted" },
  { key: "trials", label: "Trials" },
  { key: "activated", label: "Activated" },
  { key: "shared", label: "Shared" },
  { key: "converted", label: "Paid" },
];

/**
 * Discover → Paid as one row. Each count includes everyone who got at least
 * that far, so the row only ever narrows.
 */
export function Funnel({ overview }: { overview: CreatorOverview }) {
  const { funnel, referrals } = overview;
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {STEPS.map((step) => (
          <div key={step.key} className="border rounded-lg p-3 bg-card">
            <p className="text-xl font-semibold tabular-nums">
              {funnel[step.key]}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{step.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground tabular-nums">
        Referral links: {referrals.clicks} clicks · {referrals.signups} signups
        · {referrals.activations} activated · {referrals.shares} shares ·{" "}
        {referrals.paid} paid
      </p>
    </section>
  );
}
