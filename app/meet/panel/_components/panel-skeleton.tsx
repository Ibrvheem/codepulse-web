import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

/**
 * Skeleton's default bg-accent sits well above the panel background and reads
 * as a stack of grey slabs at this size, so the bars are dialled back and kept
 * thin. Counts and spacing track the real summary (title, message, task list,
 * copy button) closely enough that the panel doesn't lurch when it resolves.
 */
function Bar({ className }: { className?: string }) {
  return <Skeleton className={cn("h-2.5 bg-muted/40", className)} />;
}

export function PanelSkeleton() {
  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-3">
        <Bar className="h-2 w-20" />
        <Bar className="h-3.5 w-2/3" />
      </div>

      <div className="space-y-2.5">
        <Bar className="w-full" />
        <Bar className="w-full" />
        <Bar className="w-11/12" />
        <Bar className="w-full" />
        <Bar className="w-4/5" />
      </div>

      <div className="space-y-3.5 border-t pt-5">
        <Bar className="w-5/6" />
        <Bar className="w-2/3" />
        <Bar className="w-4/5" />
        <Bar className="w-1/2" />
        <Bar className="w-3/4" />
      </div>

      <div className="border-t pt-5">
        <Bar className="h-8 w-full bg-muted/25" />
      </div>
    </div>
  );
}
