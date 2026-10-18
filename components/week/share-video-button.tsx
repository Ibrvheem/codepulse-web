"use client";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import type { WeekVideo } from "@/lib/types";

/**
 * One tap from the story to the phone's share sheet with the MP4 attached,
 * so it posts as a real playing video on X, Instagram, WhatsApp or TikTok.
 * Desktop browsers can't attach files to a share, so there the video
 * downloads and X's composer opens with the text ready.
 */
export function ShareVideoButton({
  video,
  text,
  fileName,
}: {
  video: WeekVideo | undefined;
  /** the post text, used on desktop where the file can't be attached */
  text: string;
  fileName: string;
}) {
  const share = async () => {
    if (!video?.url) return;
    track("week_video_share_clicked");
    try {
      const blob = await (await fetch(video.url)).blob();
      const file = new File([blob], fileName, { type: "video/mp4" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        track("week_video_shared", { via: "share_sheet" });
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
      window.open(
        `https://x.com/intent/post?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer",
      );
      track("week_video_shared", { via: "download" });
    } catch {
      // The person closed the share sheet. Nothing to do.
    }
  };

  const ready = video?.status === "ready";
  return (
    <div className="flex flex-1 flex-col gap-1">
      <Button onClick={share} disabled={!ready} className="w-full">
        Share roast
      </Button>
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
