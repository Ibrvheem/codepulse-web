"use client";

import { useQuery } from "@tanstack/react-query";
import { billing } from "@/lib/api-client";
import { setAnalyticsPlan } from "@/lib/analytics";
import type { Billing } from "@/lib/types";

export const BILLING_KEY = ["billing"];

export function useBilling() {
  return useQuery({
    queryKey: BILLING_KEY,
    queryFn: async () => {
      const data = await billing.get();
      // The plan tier isn't on the auth user object — enrich the identified
      // PostHog person with it once entitlements load.
      setAnalyticsPlan(data.plan);
      return data;
    },
    staleTime: 60_000,
  });
}

/** Whole days until the trial ends (0 when it's today or past). */
export function trialDaysLeft(b: Billing): number {
  if (!b.trial_ends_at) return 0;
  const ms = new Date(b.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** Founding members get a quieter nudge — only their final week. */
export function shouldNudgeTrial(b: Billing): boolean {
  if (!b.in_trial || b.has_subscription) return false;
  const days = trialDaysLeft(b);
  return days <= (b.founding_member ? 7 : 3);
}
