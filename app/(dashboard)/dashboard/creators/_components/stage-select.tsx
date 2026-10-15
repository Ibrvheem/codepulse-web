"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Creator, CreatorStatus } from "@/lib/types";
import { useMoveCreator } from "../_hooks/use-move-creator";
import { STATUS_OPTIONS } from "../types";

/** Move a creator to any stage from wherever they're listed. */
export function StageSelect({ creator }: { creator: Creator }) {
  const move = useMoveCreator(creator.id);
  return (
    <Select
      value={creator.status}
      disabled={move.isPending}
      onValueChange={(value) => move.mutate(value as CreatorStatus)}
    >
      <SelectTrigger size="sm" className="w-36" aria-label="Stage">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
