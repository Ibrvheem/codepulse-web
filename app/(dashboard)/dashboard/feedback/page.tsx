import type { Metadata } from "next";
import { FeedbackBoard } from "./_components/feedback-board";

export const metadata: Metadata = { title: "Feedback — WriteLogs" };

export default function FeedbackPage() {
  return <FeedbackBoard />;
}
