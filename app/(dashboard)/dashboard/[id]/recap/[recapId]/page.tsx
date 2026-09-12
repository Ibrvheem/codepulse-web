import type { Metadata } from "next";
import { RecapView } from "./_components/recap-view";

export const metadata: Metadata = { title: "Recap — WriteLogs" };

export default async function RecapDetailPage({
  params,
}: {
  params: Promise<{ id: string; recapId: string }>;
}) {
  const { id, recapId } = await params;
  return <RecapView projectId={id} recapId={recapId} />;
}
