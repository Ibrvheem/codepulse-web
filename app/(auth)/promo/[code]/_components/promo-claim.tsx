"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";
import { isAuthenticated } from "@/lib/api-client";
import { savePendingPromo } from "@/lib/pending-promo";
import { useClaimPromo, usePromo } from "../_hooks/use-promo";

// Same wording as the Pro card on the pricing section.
const PRO_FEATURES = [
  "Unlimited projects",
  "Full history",
  "Recaps: a week, a sprint or a month as one summary",
  "Copy as standup: your day, ready to paste into Slack",
];

function grantHeadline(days: number) {
  if (days === 30 || days === 31) return "A free month of WriteLogs Pro";
  if (days % 30 === 0) return `${days / 30} free months of WriteLogs Pro`;
  return `${days} days of WriteLogs Pro, free`;
}

export function PromoClaim({ code }: { code: string }) {
  const { data: promo, isPending, isError, error } = usePromo(code);
  const claim = useClaimPromo(code);
  // Auth lives in the browser (a stored refresh token), so wait for mount.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const authed = isAuthenticated();
    setSignedIn(authed);
    // Not signed in yet: keep the code so the dashboard can claim it after
    // sign-up or sign-in, however they get there.
    if (!authed && promo?.available) savePendingPromo(promo.code);
  }, [promo]);

  if (isPending || signedIn === null) return <PromoSkeleton />;

  if (isError || !promo.available) {
    return (
      <FadeIn>
        <div className="space-y-1.5 mb-8">
          <h1 className="text-xl font-semibold tracking-tight">
            This link isn&apos;t available
          </h1>
          <p className="text-sm text-muted-foreground">
            {isError ? error.message : promo.reason}
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="w-full">
            Go to WriteLogs
          </Button>
        </Link>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-1.5 mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          {grantHeadline(promo.grant_days)}
        </h1>
        <p className="text-sm text-muted-foreground">
          No card needed and nothing renews. When it ends you&apos;re on the
          free plan, unless you choose to upgrade.
        </p>
      </div>

      <ul className="border rounded-lg p-4 bg-card space-y-2.5 text-sm mb-6">
        {PRO_FEATURES.map((f) => (
          <li key={f} className="flex gap-3">
            <span className="mt-2 size-1.5 rounded-full bg-muted-foreground shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {signedIn ? (
        <Button
          className="w-full"
          loading={claim.isPending}
          onClick={() => claim.mutate()}
        >
          Claim my free Pro
        </Button>
      ) : (
        <>
          <Link href="/signup">
            <Button className="w-full">Create free account</Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Pro is added to your account as soon as you&apos;re in.
          </p>
        </>
      )}

      {promo.expires_at && (
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Claim by {dayjs(promo.expires_at).format("MMM D, YYYY")}.
        </p>
      )}
    </FadeIn>
  );
}

/** Invisible text on a shimmer: it takes exactly the space, and the line breaks, of the real text. */
function Ghost({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-accent animate-pulse rounded-md text-transparent select-none [box-decoration-break:clone]">
      {children}
    </span>
  );
}

/**
 * The loaded page's own markup with the text ghosted, so every line wraps
 * where the real one will and nothing moves when it arrives. The headline
 * uses the one-month wording; the buttons are the signed-out pair, the
 * likely case for someone opening a shared link.
 */
function PromoSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="space-y-1.5 mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          <Ghost>{grantHeadline(30)}</Ghost>
        </h1>
        <p className="text-sm">
          <Ghost>
            No card needed and nothing renews. When it ends you&apos;re on the
            free plan, unless you choose to upgrade.
          </Ghost>
        </p>
      </div>

      <ul className="border rounded-lg p-4 bg-card space-y-2.5 text-sm mb-6">
        {PRO_FEATURES.map((f) => (
          <li key={f} className="flex gap-3">
            <span className="mt-2 size-1.5 rounded-full bg-muted shrink-0" />
            <span>
              <Ghost>{f}</Ghost>
            </span>
          </li>
        ))}
      </ul>

      <Skeleton className="h-9 w-full" />
      <p className="mt-4 text-sm text-center">
        <Ghost>Already have an account? Sign in</Ghost>
      </p>
      <p className="mt-6 text-xs text-center">
        <Ghost>Pro is added to your account as soon as you&apos;re in.</Ghost>
      </p>
    </div>
  );
}
