"use client";

import { Button } from "@/components/ui/button";
import type { Meta } from "@/lib/types";

export function PaginationControls({
  meta,
  onPageChange,
}: {
  meta: Meta;
  onPageChange: (page: number) => void;
}) {
  if (meta.total_pages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-muted-foreground tabular-nums">
        Page {meta.page} of {meta.total_pages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.has_prev_page}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.has_next_page}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
