"use client";

import { Button } from "@/components/ui/button";
import type { Creator, ReferralStats } from "@/lib/types";
import { useCreatorActions } from "../_hooks/use-creator-actions";
import { CopyButton } from "./copy-button";

const STATS: { key: keyof ReferralStats; label: string }[] = [
  { key: "clicks", label: "Clicks" },
  { key: "signups", label: "Signups" },
  { key: "activations", label: "Activated" },
  { key: "shares", label: "Shares" },
  { key: "paid", label: "Paid" },
];

/** Their promo link and what the accounts that claimed it went on to do. */
export function ReferralPanel({ creator }: { creator: Creator }) {
  const { referral } = useCreatorActions(creator.id);
  const link = creator.referral;

  return (
    <section className="border rounded-lg p-4 bg-card space-y-4">
      <div>
        <h2 className="text-sm font-medium">Referral link</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {link
            ? `Gives ${link.grant_days} days of Pro to them and to anyone they share it with.`
            : "One link for their own trial and for their audience."}
        </p>
      </div>

      {link ? (
        <>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate rounded-md border bg-muted px-3 py-1.5 text-xs">
              {link.url}
            </code>
            <CopyButton text={link.url} copied="Link copied" />
          </div>
          <dl className="grid grid-cols-5 gap-3">
            {STATS.map(({ key, label }) => (
              <div key={key}>
                <dd className="text-lg font-semibold tabular-nums">
                  {link[key]}
                </dd>
                <dt className="text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          loading={referral.isPending}
          onClick={() => referral.mutate()}
        >
          Create link
        </Button>
      )}
    </section>
  );
}
