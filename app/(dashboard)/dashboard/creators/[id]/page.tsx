import type { Metadata } from "next";
import { CreatorDetail } from "./_components/creator-detail";

export const metadata: Metadata = { title: "Creator" };

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CreatorDetail id={id} />;
}
