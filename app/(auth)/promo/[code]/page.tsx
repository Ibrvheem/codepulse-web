import type { Metadata } from "next";
import { PromoClaim } from "./_components/promo-claim";

export const metadata: Metadata = { title: "Free Pro" };

export default async function PromoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <PromoClaim code={code} />;
}
