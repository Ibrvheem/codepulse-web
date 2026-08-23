import type { Metadata } from "next";
import { ProjectDetailView } from "./_components/project-detail-view";

export const metadata: Metadata = { title: "Project — WriteLogs" };

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  return <ProjectDetailView projectId={id} initialTab={tab} />;
}
