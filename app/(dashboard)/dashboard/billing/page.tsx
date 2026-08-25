import type { Metadata } from "next";
import { BillingView } from "./_components/billing-view";

export const metadata: Metadata = { title: "Billing — WriteLogs" };

export default function BillingPage() {
  return <BillingView />;
}
