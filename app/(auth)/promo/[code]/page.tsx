import type { Metadata } from "next";
import { billing } from "@/lib/api-client";
import { PromoClaim } from "./_components/promo-claim";

export const metadata: Metadata = { title: "Free Pro" };

export default async function PromoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // One count per page view, for referral click numbers. Never blocks the page.
  await billing.promoClick(code).catch(() => undefined);
  return <PromoClaim code={code} />;
}
