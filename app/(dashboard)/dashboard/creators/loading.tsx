import { Skeleton } from "@/components/ui/skeleton";
import { CreatorsSkeleton, FunnelSkeleton } from "./_components/creators-skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>
      <FunnelSkeleton />
      <CreatorsSkeleton rows={4} />
    </div>
  );
}
