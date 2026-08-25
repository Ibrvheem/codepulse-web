"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shouldNudgeTrial, trialDaysLeft, useBilling } from "../_hooks/use-billing";
import { BILLING_PATH } from "../_hooks/use-upgrade-toast";

const dismissKey = (trialEndsAt: string) => `writelogs.trial-nudge:${trialEndsAt}`;

function readDismissed(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/** Last-days-of-trial nudge. Dismissal is remembered per trial end date. */
export function TrialBanner() {
  const { data: billing } = useBilling();
  const [dismissed, setDismissed] = useState<string | null>(null);

  if (!billing || !billing.trial_ends_at || !shouldNudgeTrial(billing)) return null;

  const key = dismissKey(billing.trial_ends_at);
  if (dismissed === key || readDismissed(key)) return null;

  const days = trialDaysLeft(billing);
  const when = days === 0 ? "today" : days === 1 ? "in 1 day" : `in ${days} days`;

  const dismiss = () => {
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // storage unavailable — it'll show again next visit, which is fine
    }
    setDismissed(key);
  };

  return (
    <div className="border-b bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-2 flex items-center justify-between gap-3 text-sm">
        <p>
          Your Pro trial ends {when} — keep unlimited projects and Copy as
          standup.
        </p>
        <span className="flex items-center gap-1 shrink-0">
          <Link href={BILLING_PATH}>
            <Button size="sm" variant="outline">
              Upgrade
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Dismiss"
            onClick={dismiss}
          >
            <X className="size-4" />
          </Button>
        </span>
      </div>
    </div>
  );
}
