"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { summaries } from "@/lib/api-client";
import { copyText } from "@/lib/utils";
import type { ShareLink } from "@/lib/types";

const TWEET_TEXT =
  "Everything I (and my AI) shipped yesterday, written for me by WriteLogs 👇";

export function ShareSummary({ summaryId }: { summaryId: string }) {
  const [share, setShare] = useState<ShareLink | null>(null);
  const [open, setOpen] = useState(false);

  const create = useMutation({
    mutationFn: () => summaries.share(summaryId),
    onSuccess: (link) => {
      setShare(link);
      setOpen(true);
    },
    onError: (error) => toast.error(error.message),
  });

  const stop = useMutation({
    mutationFn: () => summaries.unshare(summaryId),
    onSuccess: () => {
      setShare(null);
      setOpen(false);
      toast.success("Sharing stopped — the link no longer works.");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCopy = async () => {
    if (!share) return;
    if (await copyText(share.url)) toast.success("Link copied.");
    else toast.error("Couldn't access the clipboard.");
  };

  const intent = share
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(TWEET_TEXT)}&url=${encodeURIComponent(share.url)}`
    : "#";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          loading={create.isPending}
          onClick={(event) => {
            // First click creates the share link; after that the trigger just
            // toggles the popover.
            if (!share) {
              event.preventDefault();
              create.mutate();
            }
          }}
        >
          {share ? "Sharing · Copy link" : "Share"}
        </Button>
      </PopoverTrigger>
      {share && (
        <PopoverContent align="end" className="w-80 space-y-3">
          <p className="text-xs text-muted-foreground">
            Anyone with this link can see the summary.
          </p>
          <div className="flex items-center gap-2">
            <p className="flex-1 min-w-0 truncate rounded-md border bg-muted/40 px-2.5 py-1.5 font-mono text-xs">
              {share.url}
            </p>
            <Button size="sm" onClick={handleCopy}>
              Copy
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <a
              href={intent}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline underline-offset-4"
            >
              Share on X
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              loading={stop.isPending}
              onClick={() => stop.mutate()}
            >
              Stop sharing
            </Button>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
