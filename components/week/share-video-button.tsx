"use client";

import type { ReactNode } from "react";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { track } from "@/lib/analytics";
import type { WeekVideo } from "@/lib/types";

/**
 * Download saves the MP4 straight from storage, ready to post as a video.
 * Share opens the device's share sheet with the roast's link and text.
 * Both act on the click itself: nothing is fetched first, so the browser
 * never decides the click has gone stale and silently blocks it.
 */
export function ShareVideoButton({
  video,
  text,
  link,
  lead,
}: {
  video: WeekVideo | undefined;
  /** the post text */
  text: string;
  /** the public roast page, minted ahead of time */
  link: string | undefined;
  /** The main action. When set, Download and Share shrink to icons beside it. */
  lead?: ReactNode;
}) {
  const ready = video?.status === "ready" && Boolean(video.download_url);

  const share = async () => {
    if (!link) return;
    track("week_video_share_clicked");
    if (navigator.share) {
      try {
        await navigator.share({ text, url: link });
        track("week_video_shared", { via: "share_sheet" });
      } catch {
        // closed the sheet
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${link}`);
      toast.success("Link copied. Paste it anywhere.");
      track("week_video_shared", { via: "copy" });
    } catch {
      toast.info(link);
    }
  };

  if (lead && ready) {
    return (
      <TooltipProvider>
        <div className="flex gap-2">
          {lead}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="outline" size="icon">
                <a
                  href={video!.download_url}
                  download
                  aria-label="Download video"
                  onClick={() => track("week_video_downloaded")}
                >
                  <Download className="size-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download video</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Share"
                disabled={!link}
                onClick={share}
              >
                <Share2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex gap-2">
        {ready ? (
          <Button asChild className="flex-1">
            <a
              href={video!.download_url}
              download
              onClick={() => track("week_video_downloaded")}
            >
              <Download className="size-4" />
              Download video
            </a>
          </Button>
        ) : (
          <Button disabled className="flex-1">
            <Download className="size-4" />
            Download video
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1"
          disabled={!link}
          onClick={share}
        >
          <Share2 className="size-4" />
          Share
        </Button>
      </div>
      {!ready ? (
        <p className="text-center text-xs text-muted-foreground">
          {video?.status === "rendering"
            ? "The video is still rendering."
            : "The video is on its way."}
        </p>
      ) : null}
    </div>
  );
}
