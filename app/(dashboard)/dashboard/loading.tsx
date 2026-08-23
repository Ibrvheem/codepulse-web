import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsSkeleton } from "./_components/projects-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
      <ProjectsSkeleton />
    </div>
  );
}
