"use client";

import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";
import { ErrorState } from "../../../_components/query-states";
import { trialDaysLeft, useBilling } from "../../../_hooks/use-billing";
import {
  useBillingPortal,
  useCheckoutConfig,
  useOpenCheckout,
  useProCelebration,
} from "../_hooks/use-checkout";
import { ProCelebration } from "./pro-celebration";

export function BillingView() {
  const { data: billing, isPending, isError, error, refetch, isRefetching } =
    useBilling();
  const checkout = useCheckoutConfig();
  const open = useOpenCheckout(checkout.data);
  const portal = useBillingPortal();
  const celebration = useProCelebration();

  if (isPending) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => refetch()}
        retrying={isRefetching}
      />
    );
  }

  const isPro = billing.plan === "pro";
  const days = trialDaysLeft(billing);

  const statusLine = billing.in_trial
    ? billing.founding_member
      ? `Founding member · Pro until ${dayjs(billing.trial_ends_at).format("MMM D, YYYY")}`
      : `Pro trial · ${days} ${days === 1 ? "day" : "days"} left`
    : billing.has_subscription
      ? `${billing.subscription_status ?? "Active"}${
          billing.current_period_end
            ? ` · renews ${dayjs(billing.current_period_end).format("MMM D, YYYY")}`
            : ""
        }`
      : isPro
        ? "Pro plan"
        : "No subscription — upgrade anytime";

  // Upgrade buttons only make sense without a subscription, and only where
  // billing is configured (a 400 from /billing/checkout means it isn't).
  const showUpgrade = !billing.has_subscription && !checkout.notConfigured;

  return (
    <FadeIn className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight">Billing</h1>

      {celebration.celebrating && (
        <ProCelebration onDismiss={celebration.dismiss} />
      )}

      <div className="border rounded-lg bg-card p-5">
        <p className="text-lg font-semibold">{isPro ? "Pro" : "Free"}</p>
        <p className="text-sm text-muted-foreground mt-1">{statusLine}</p>

        {billing.has_subscription && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              loading={portal.isPending}
              onClick={() => portal.mutate()}
            >
              Manage subscription
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Update your card, switch plans, or cancel — opens in a new tab.
            </p>
          </div>
        )}
      </div>

      {showUpgrade && (
        <div className="border rounded-lg bg-card p-5 space-y-4">
          <div>
            <p className="font-medium">
              {billing.in_trial ? "Keep Pro after your trial" : "Upgrade to Pro"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Unlimited projects, full history, Copy as standup, both voices,
              and 3 updates a day.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="sm:flex-1"
              loading={open.isPending && open.variables === checkout.data?.prices.monthly}
              disabled={checkout.isPending || open.isPending}
              onClick={() => checkout.data && open.mutate(checkout.data.prices.monthly)}
            >
              Monthly · $8/mo
            </Button>
            <Button
              className="sm:flex-1"
              variant="outline"
              loading={open.isPending && open.variables === checkout.data?.prices.yearly}
              disabled={checkout.isPending || open.isPending}
              onClick={() => checkout.data && open.mutate(checkout.data.prices.yearly)}
            >
              Yearly · $6/mo
              <span className="text-muted-foreground font-normal">
                · billed $72
              </span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Checkout opens in a secure overlay. Your plan updates within
            seconds of completing it.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 border rounded-lg p-5 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
            Free
          </p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>1 project</li>
            <li>Last 7 days of summaries</li>
            <li>1 manual update a day</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
            Pro
          </p>
          <ul className="space-y-1.5">
            <li>Unlimited projects</li>
            <li>Full history</li>
            <li>3 manual updates a day</li>
            <li>Copy as standup — your day as a paste-ready update</li>
            <li>Both voices — “you” and “I”</li>
          </ul>
        </div>
      </div>
    </FadeIn>
  );
}
