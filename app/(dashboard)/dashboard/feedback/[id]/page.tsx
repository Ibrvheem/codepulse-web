import type { Metadata } from "next";
import { FeedbackDetail } from "./_components/feedback-detail";

export const metadata: Metadata = { title: "Feedback — WriteLogs" };

export default async function FeedbackPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FeedbackDetail id={id} />;
}
