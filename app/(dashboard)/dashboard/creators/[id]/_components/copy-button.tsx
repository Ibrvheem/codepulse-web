"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({
  text,
  label = "Copy",
  copied = "Copied",
  disabled,
}: {
  /** Read at click time, so it can follow an input being edited. */
  text: string | (() => string);
  label?: string;
  copied?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(
            typeof text === "function" ? text() : text,
          );
          toast.success(copied);
        } catch {
          toast.error("Couldn't copy. Select the text and copy it by hand.");
        }
      }}
    >
      {label}
    </Button>
  );
}
