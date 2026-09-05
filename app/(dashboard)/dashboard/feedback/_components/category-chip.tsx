import type { FeedbackCategory } from "@/lib/types";
import { CATEGORY_META } from "../types";

export function CategoryChip({ category }: { category: FeedbackCategory }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
      {CATEGORY_META[category].label}
    </span>
  );
}
