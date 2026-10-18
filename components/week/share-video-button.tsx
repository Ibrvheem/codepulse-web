"use client";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import type { WeekVideo } from "@/lib/types";

/**
 * One tap from the final slide to the phone's share sheet with the MP4
 * attached, so it posts as a real playing video on X, Instagram, WhatsApp
 * or TikTok. Desktop browsers can't attach files to a share, so there the
 * video downloads and X's composer opens with the text ready.
 */
export function ShareVideoButton({
  video,
  rendering,
  onRender,
  text,
  fileName,
}: {
  video: WeekVideo | undefined;
  rendering: boolean;
  onRender: () => void;
  /** the post text, used on desktop where the file can't be attached */
  text: string;
  fileName: string;
}) {
  const busy = rendering || video?.status === "rendering";

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
      // Desktop: save the file, then open X with the words ready.
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

  if (video?.status === "ready") {
    return (
      <Button onClick={share} className="flex-1">
        Share video
      </Button>
    );
  }
  return (
    <div className="flex flex-1 flex-col gap-1">
      <Button onClick={onRender} disabled={busy} className="w-full">
        {busy ? "Making your video…" : "Make the video"}
      </Button>
      {busy ? (
        <p className="text-center text-xs text-muted-foreground">
          About a minute. You can leave this tab open.
        </p>
      ) : video?.status === "failed" ? (
        <p className="text-center text-xs text-destructive">{video.reason}</p>
      ) : null}
    </div>
  );
}
