import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the shape of a rendered summary (date, title, message, tasks, copy
 * button) so the swap to real content doesn't shift the panel around.
 */
export function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      <div className="space-y-3 border-t pt-4">
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>

      <div className="border-t pt-4">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
