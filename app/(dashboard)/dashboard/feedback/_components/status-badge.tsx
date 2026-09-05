import type { FeedbackStatus } from "@/lib/types";
import { STATUS_META } from "../types";

export function StatusBadge({ status }: { status: FeedbackStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
