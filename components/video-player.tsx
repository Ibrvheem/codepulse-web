"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The landing demo player. Built by hand rather than using the native controls
 * because the default chrome is a different visual language on every browser,
 * and this is the one frame on the page a visitor stares at for a minute.
 *
 * Progress is driven by requestAnimationFrame instead of `timeupdate`, which
 * only fires ~4x a second and makes the bar look like it is stepping.
 */

type Props = {
  src: string;
  poster: string;
  /** Shown over the poster before the first play. */
  title?: string;
  caption?: string;
  className?: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoPlayer({ src, poster, title, caption, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [scrubbing, setScrubbing] = useState(false);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [idle, setIdle] = useState(false);

  /* Smooth playhead. One rAF loop, only while the video is actually moving. */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v) {
        if (!scrubbing) setCurrent(v.currentTime);
        const ranges = v.buffered;
        if (ranges.length) setBuffered(ranges.end(ranges.length - 1));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, scrubbing]);

  /* Controls fade out while playing and the pointer sits still. */
  const wake = useCallback(() => {
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2200);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      setIdle(false);
      return;
    }
    wake();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [playing, wake]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      setStarted(true);
      void v.play();
    } else {
      v.pause();
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const next = Math.min(Math.max(seconds, 0), v.duration);
    v.currentTime = next;
    setCurrent(next);
  }, []);

  const ratioFromEvent = useCallback((clientX: number) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  }, []);

  const onBarDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setScrubbing(true);
    const r = ratioFromEvent(e.clientX);
    setCurrent(r * duration);
    seekTo(r * duration);
    // Capture last: it throws if the pointer id is already gone, and the seek
    // matters more than keeping the drag alive.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* drag still works without capture, it just stops at the edge */
    }
  };

  const onBarMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = ratioFromEvent(e.clientX);
    setHoverRatio(r);
    if (!scrubbing) return;
    setCurrent(r * duration);
    seekTo(r * duration);
  };

  const onBarUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setScrubbing(false);
  };

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void wrapRef.current?.requestFullscreen?.();
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") {
      e.preventDefault();
      toggle();
    } else if (k === "arrowright") {
      e.preventDefault();
      seekTo(current + 5);
    } else if (k === "arrowleft") {
      e.preventDefault();
      seekTo(current - 5);
    } else if (k === "m") {
      const v = videoRef.current;
      if (v) {
        v.muted = !v.muted;
        setMuted(v.muted);
      }
    } else if (k === "f") {
      toggleFullscreen();
    }
    wake();
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;
  // Before the first play the poster owns the frame: its title sits where the
  // control bar would be, so the bar only exists once playback has started.
  const controlsHidden = !started || (playing && idle && !scrubbing);

  return (
    <figure className={cn("group/player relative", className)}>
      {/* Soft bloom behind the frame. Pure decoration, never clickable. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-6 -bottom-10 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(116,70,216,0.13),transparent_70%)] blur-2xl"
      />

      <div
        ref={wrapRef}
        tabIndex={0}
        role="group"
        aria-label={title ?? "Product demo video"}
        onKeyDown={onKeyDown}
        onPointerMove={wake}
        onPointerLeave={() => {
          setHoverRatio(null);
          if (playing) setIdle(true);
        }}
        className={cn(
          "relative isolate overflow-hidden rounded-2xl bg-neutral-950 shadow-[0_2px_8px_rgba(15,15,20,0.06),0_24px_60px_-20px_rgba(15,15,20,0.35)] ring-1 ring-neutral-900/10 outline-none transition-shadow duration-500",
          "focus-visible:ring-2 focus-visible:ring-[#7446D8]/60",
          fullscreen ? "rounded-none" : "",
          playing && idle && !scrubbing && "cursor-none",
        )}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="metadata"
          playsInline
          onClick={toggle}
          onPlay={() => {
            setStarted(true);
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onWaiting={() => setWaiting(true)}
          onPlaying={() => setWaiting(false)}
          onEnded={() => {
            setPlaying(false);
            setIdle(false);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={(e) => {
            setMuted(e.currentTarget.muted);
            setVolume(e.currentTarget.volume);
          }}
          className={cn(
            "block w-full cursor-pointer bg-neutral-950",
            fullscreen ? "h-screen object-contain" : "aspect-video object-cover",
          )}
        />

        {/* Poster state. Fades out on first play and never comes back. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-500",
            started ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,10,12,0.92)_0%,rgba(10,10,12,0.55)_14%,rgba(10,10,12,0.08)_34%,rgba(10,10,12,0.28)_100%)]" />
          {(title || caption) && (
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-left">
              {title && (
                <p className="text-sm sm:text-base font-medium text-white/95 tracking-[-0.01em]">
                  {title}
                </p>
              )}
              {caption && (
                <p className="mt-1 text-xs sm:text-sm text-white/55">{caption}</p>
              )}
            </div>
          )}
          {duration > 0 && (
            <span className="absolute right-4 top-4 rounded-full bg-neutral-950/55 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/80 backdrop-blur-md">
              {formatTime(duration)}
            </span>
          )}
        </div>

        {/* Big play affordance: shown before the first play and whenever paused. */}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause video" : "Play video"}
          className={cn(
            "absolute inset-0 grid place-items-center transition-opacity duration-300",
            playing ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <span
            className={cn(
              "relative grid size-[72px] place-items-center rounded-full bg-white/95 text-neutral-900 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm",
              "transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/player:scale-[1.06]",
            )}
          >
            {!started && (
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-white/40 motion-reduce:animate-none"
              />
            )}
            <svg viewBox="0 0 24 24" className="relative ml-1 size-7 fill-current">
              <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
        </button>

        {/* Buffering spinner */}
        {waiting && playing && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="size-9 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
          </div>
        )}

        {/* Control bar */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
            controlsHidden
              ? "pointer-events-none translate-y-3 opacity-0"
              : "translate-y-0 opacity-100",
          )}
        >
          <div className="bg-gradient-to-t from-neutral-950/85 via-neutral-950/45 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
            {/* Scrubber */}
            <div
              ref={barRef}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(current)}
              aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
              tabIndex={0}
              onPointerDown={onBarDown}
              onPointerMove={onBarMove}
              onPointerUp={onBarUp}
              onPointerCancel={onBarUp}
              onPointerLeave={() => setHoverRatio(null)}
              className="group/bar relative -mx-1 cursor-pointer px-1 py-2 touch-none"
            >
              <div className="relative h-1 w-full overflow-visible rounded-full bg-white/20">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/25"
                  style={{ width: `${bufferedPct}%` }}
                />
                {/* No transition here. The width is already re-set every
                    animation frame, and a CSS transition restarts from the
                    current value each time, so the fill renders behind the
                    thumb and crawls for a second after a seek. */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={{ width: `${progress}%` }}
                />
                <span
                  className={cn(
                    "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.5)]",
                    "transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    scrubbing ? "scale-125" : "scale-0 group-hover/bar:scale-100",
                  )}
                  style={{ left: `${progress}%` }}
                />
              </div>

              {/* Hover time readout */}
              {hoverRatio !== null && duration > 0 && (
                <span
                  className="pointer-events-none absolute -top-6 -translate-x-1/2 rounded-md bg-neutral-950/85 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm"
                  style={{ left: `${hoverRatio * 100}%` }}
                >
                  {formatTime(hoverRatio * duration)}
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-1 flex items-center gap-1 text-white">
              <IconButton
                label={playing ? "Pause" : "Play"}
                onClick={toggle}
                path={
                  playing
                    ? "M8 5h3v14H8zM13 5h3v14h-3z"
                    : "M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z"
                }
              />

              <div className="group/vol flex items-center">
                <IconButton
                  label={muted || volume === 0 ? "Unmute" : "Mute"}
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    v.muted = !v.muted;
                    if (!v.muted && v.volume === 0) v.volume = 1;
                  }}
                  path={
                    muted || volume === 0
                      ? "M4 9v6h4l5 4V5L8 9H4Zm12.5 3 2.8-2.8-1.1-1.1-2.8 2.8-2.8-2.8-1.1 1.1 2.8 2.8-2.8 2.8 1.1 1.1 2.8-2.8 2.8 2.8 1.1-1.1-2.8-2.8Z"
                      : "M4 9v6h4l5 4V5L8 9H4Zm11.5 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 15.5 12Zm-2 6.7a6.5 6.5 0 0 0 0-13.4v1.7a4.8 4.8 0 0 1 0 10v1.7Z"
                  }
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={muted ? 0 : volume}
                  aria-label="Volume"
                  onChange={(e) => {
                    const v = videoRef.current;
                    if (!v) return;
                    const next = Number(e.target.value);
                    v.volume = next;
                    v.muted = next === 0;
                  }}
                  className="wl-volume w-0 opacity-0 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/vol:ml-1 group-hover/vol:w-16 group-hover/vol:opacity-100 focus-visible:ml-1 focus-visible:w-16 focus-visible:opacity-100"
                />
              </div>

              <span className="ml-1.5 select-none text-xs font-medium tabular-nums text-white/75">
                {formatTime(current)}{" "}
                <span className="text-white/35">/ {formatTime(duration)}</span>
              </span>

              <div className="ml-auto flex items-center gap-1">
                <IconButton
                  label={fullscreen ? "Exit full screen" : "Full screen"}
                  onClick={toggleFullscreen}
                  path={
                    fullscreen
                      ? "M9 9H4v2h3v3h2V9Zm6 0v5h2v-3h3V9h-5ZM9 15H4v2h3v3h2v-5Zm6 5h2v-3h3v-2h-5v5Z"
                      : "M4 9V4h5v2H6v3H4Zm11-5h5v5h-2V6h-3V4ZM6 15v3h3v2H4v-5h2Zm12 0h2v5h-5v-2h3v-3Z"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

function IconButton({
  label,
  onClick,
  path,
}: {
  label: string;
  onClick: () => void;
  path: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-full text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <svg viewBox="0 0 24 24" className="size-[18px] fill-current">
        <path d={path} />
      </svg>
    </button>
  );
}
