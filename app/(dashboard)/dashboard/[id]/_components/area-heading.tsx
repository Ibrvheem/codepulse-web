"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AreasPanel } from "./areas-panel";

/**
 * A group heading, with a shortcut to the project's area list.
 *
 * Renaming is project-wide, so it belongs with the project's other settings
 * and that is where it lives. The shortcut exists because you notice a wrong
 * name while reading a summary, not while in settings. It opens the same
 * panel rather than an input on this heading: seeing the whole vocabulary is
 * what tells you the change is bigger than the line you clicked.
 */
export function AreaHeading({
  area,
  projectId,
}: {
  area: string;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 mb-1.5">
        <p className="text-sm font-medium">{area}</p>
        {/* Always visible: a control you can only find by hovering is a
            control most people never find. Kept muted and small so a page of
            headings still reads as headings. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-muted-foreground underline underline-offset-2 decoration-dotted transition-colors hover:text-foreground"
        >
          Rename
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Project areas</DialogTitle>
            <DialogDescription>
              The names this project uses to group your work.
            </DialogDescription>
          </DialogHeader>
          <AreasPanel projectId={projectId} highlight={area} enabled={open} />
        </DialogContent>
      </Dialog>
    </>
  );
}
