import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}
