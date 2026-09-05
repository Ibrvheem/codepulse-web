import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackSkeleton } from "./_components/feedback-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-9 w-80" />
      <FeedbackSkeleton />
    </div>
  );
}
