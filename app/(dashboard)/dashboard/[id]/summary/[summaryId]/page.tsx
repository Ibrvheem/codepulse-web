import type { Metadata } from "next";
import { SummaryView } from "./_components/summary-view";

export const metadata: Metadata = { title: "Summary — WriteLogs" };

export default async function SummaryDetailPage({
  params,
}: {
  params: Promise<{ id: string; summaryId: string }>;
}) {
  const { id, summaryId } = await params;
  return <SummaryView projectId={id} summaryId={summaryId} />;
}
