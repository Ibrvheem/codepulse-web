"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import type { StoryBeat, Week } from "@/lib/types";

/**
 * The hook-first roast, as the video plays it: punchline first, a beat per
 * fact with Loggy reacting, captions that follow the voice word by word,
 * and a verdict to screenshot. Slides come from the API, so slide N here is
 * slide N in the narration route and in the rendered MP4.
 */

const SILENT_SLIDE_MS = 5000;
const SILENT_SPEAK_SEC = 4.2;

type Palette = { bg: string; fg: string; accent: string; ink: string };
const PALETTES: Record<string, Palette> = {
  hook: { bg: "#0a0a0a", fg: "#ffffff", accent: "#D4FF3A", ink: "#0a0a0a" },
  shipped: { bg: "#FF4D2E", fg: "#FFF4E8", accent: "#0a0a0a", ink: "#FFF4E8" },
  commit: { bg: "#FFD60A", fg: "#0a0a0a", accent: "#0a0a0a", ink: "#FFD60A" },
  busiest: { bg: "#4B2AFF", fg: "#EDE9FF", accent: "#D4FF3A", ink: "#0a0a0a" },
  late: { bg: "#120018", fg: "#FFE4F6", accent: "#FF5CC8", ink: "#120018" },
  weekend: { bg: "#00C2A8", fg: "#06201C", accent: "#06201C", ink: "#00C2A8" },
  boundaries: {
    bg: "#00C2A8",
    fg: "#06201C",
    accent: "#06201C",
    ink: "#00C2A8",
  },
  file: { bg: "#FF7AB6", fg: "#2B0016", accent: "#2B0016", ink: "#FF7AB6" },
  areas: { bg: "#1D5BFF", fg: "#EAF0FF", accent: "#D4FF3A", ink: "#0a0a0a" },
  quiet: { bg: "#F2EFE6", fg: "#0a0a0a", accent: "#0a0a0a", ink: "#F2EFE6" },
  verdict: { bg: "#0a0a0a", fg: "#ffffff", accent: "#D4FF3A", ink: "#0a0a0a" },
};
const FALLBACK = PALETTES.verdict;

// ── captions ────────────────────────────────────────────────────────────────

type Word = { text: string; start: number; end: number };

/** Same estimate as the video: longer words and pauses take longer. */
function timeWords(caption: string, speakSec: number): Word[] {
  const words = caption.split(/\s+/).filter(Boolean);
  const weight = (w: string) => w.length + 2 + (/[.,!?:]$/.test(w) ? 4 : 0);
  const total = words.reduce((n, w) => n + weight(w), 0) || 1;
  let t = 0;
  return words.map((text) => {
    const span = (weight(text) / total) * speakSec;
    const word = { text, start: t, end: t + span };
    t += span;
    return word;
  });
}

function chunk(words: Word[]): Word[][] {
  const chunks: Word[][] = [];
  let current: Word[] = [];
  for (const word of words) {
    current.push(word);
    const chars = current.reduce((n, w) => n + w.text.length, 0);
    if (current.length >= 3 || chars >= 16 || /[.,!?:]$/.test(word.text)) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function Captions({
  caption,
  t,
  speakSec,
  palette,
}: {
  caption: string;
  t: number;
  speakSec: number;
  palette: Palette;
}) {
  const chunks = chunk(timeWords(caption, speakSec));
  const index = chunks.findIndex((c) => t < c[c.length - 1].end);
  const shown = chunks[index === -1 ? chunks.length - 1 : index];
  if (!shown) return null;
  return (
    <motion.div
      key={shown[0].start}
      initial={{ scale: 0.86, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.25, bounce: 0.3 }}
      className="absolute inset-x-5 bottom-[31%] flex flex-wrap justify-center gap-x-1.5 gap-y-1"
    >
      {shown.map((word) => {
        const active = t >= word.start && t < word.end;
        return (
          <span
            key={`${word.start}-${word.text}`}
            className="rounded-md px-1.5 text-[1.75rem] font-extrabold leading-tight tracking-tight"
            style={{
              color: active ? palette.ink : palette.fg,
              background: active ? palette.accent : "transparent",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </motion.div>
  );
}

// ── slide ───────────────────────────────────────────────────────────────────

function Hero({ beat, palette }: { beat: StoryBeat; palette: Palette }) {
  if (beat.key === "hook") {
    const words = beat.hero.split(/\s+/);
    return (
      <div className="absolute inset-x-6 top-[14%]">
        <p
          className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: palette.accent }}
        >
          {beat.eyebrow}
        </p>
        <p className="flex flex-wrap gap-x-2 text-[2.6rem] font-extrabold leading-none tracking-[-0.045em]">
          {words.map((word, i) => (
            <motion.span
              key={`${i}-${word}`}
              initial={{ scale: 1.3, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                duration: 0.35,
                bounce: 0.35,
                delay: i * 0.07,
              }}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
        </p>
      </div>
    );
  }

  if (beat.key === "verdict") {
    return (
      <div className="absolute inset-x-6 top-[11%] text-center">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
          The verdict
        </p>
        <motion.p
          initial={{ scale: 3, rotate: -14, opacity: 0 }}
          animate={{ scale: 1, rotate: -4, opacity: 1 }}
          transition={{
            type: "spring",
            duration: 0.6,
            bounce: 0.4,
            delay: 0.25,
          }}
          className="inline-block text-[6.5rem] font-extrabold leading-none tracking-[-0.06em]"
          style={{ color: palette.accent }}
        >
          {beat.score ? `${beat.score}/10` : beat.hero}
        </motion.p>
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            duration: 0.5,
            bounce: 0.2,
            delay: 0.6,
          }}
          className="mt-2 text-2xl font-extrabold tracking-tight"
        >
          {beat.eyebrow}
        </motion.p>
      </div>
    );
  }

  const numeric = /^\d+%?$/.test(beat.hero);
  const long = beat.hero.length > 14;
  return (
    <div className="absolute inset-x-6 top-[13%]">
      <p
        className="mb-3 inline-block rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
        style={{ background: palette.accent, color: palette.ink }}
      >
        {beat.eyebrow}
      </p>
      <motion.p
        initial={{ scale: 2.4, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: numeric ? -3 : 0, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.45 }}
        className={`origin-left font-extrabold tracking-[-0.06em] [overflow-wrap:anywhere] ${
          numeric
            ? "text-[8.5rem] leading-[0.85]"
            : long
              ? "text-[2.4rem] leading-none"
              : "text-6xl leading-none"
        }`}
      >
        {beat.hero}
      </motion.p>
    </div>
  );
}

function Loggy({ beat }: { beat: StoryBeat }) {
  const center = beat.key === "verdict";
  const right = beat.key === "hook";
  return (
    <motion.div
      initial={center ? { scale: 0.4, opacity: 0 } : { y: 140 }}
      animate={center ? { scale: 1, opacity: 1 } : { y: 0 }}
      transition={{ type: "spring", duration: 0.6, bounce: 0.4, delay: 0.2 }}
      className={`absolute ${
        center
          ? "left-1/2 top-[45%] w-[28%] -translate-x-1/2"
          : right
            ? "bottom-4 right-3 w-[36%]"
            : "bottom-4 left-3 w-[36%]"
      }`}
    >
      <Image
        src={`/loggy/loggy-${beat.pose}.png`}
        alt=""
        width={300}
        height={300}
        className="h-auto w-full drop-shadow-xl"
      />
    </motion.div>
  );
}

// ── player ──────────────────────────────────────────────────────────────────

let tick = 0;
/** A clock for silent playback; reads a shared tick so snapshots are stable. */
function useNow(active: boolean) {
  return useSyncExternalStore(
    (notify) => {
      if (!active) return () => {};
      const id = window.setInterval(() => {
        tick = Date.now();
        notify();
      }, 50);
      return () => window.clearInterval(id);
    },
    () => (active ? tick : 0),
    () => 0,
  );
}

export function RoastStory({
  week,
  story,
  footer,
  audioBase,
}: {
  week: Week;
  story: StoryBeat[];
  footer?: React.ReactNode;
  audioBase?: string;
}) {
  const persona = week.persona;
  const voiced = Boolean(audioBase && persona?.voice_id);
  const reduceMotion = useReducedMotion() ?? false;
  const [started, setStarted] = useState(!voiced);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  /** playback position of the current line, from the audio element */
  const [audioT, setAudioT] = useState(0);
  const [audioDur, setAudioDur] = useState(0);
  const [spokenIndex, setSpokenIndex] = useState(-1);

  const last = index === story.length - 1;
  const playing = started && !last;
  const onClock = started && (!voiced || muted);
  const now = useNow(onClock);
  const elapsed = onClock && now > 0 ? Math.max(0, now - startedAt) : 0;

  const go = (next: number) => {
    setIndex(Math.max(0, Math.min(story.length - 1, next)));
    setStartedAt(Date.now());
    setAudioT(0);
    setAudioDur(0);
  };
  if (playing && onClock && elapsed >= SILENT_SLIDE_MS) go(index + 1);
  if (playing && voiced && !muted && spokenIndex === index) go(index + 1);

  const beat = story[index];
  const palette = PALETTES[beat.key] ?? FALLBACK;
  const captionT = voiced && !muted ? audioT : elapsed / 1000;
  const speakSec =
    voiced && !muted && audioDur > 0 ? audioDur : SILENT_SPEAK_SEC;
  const src = (i: number) => `${audioBase}/${i}`;

  return (
    <div className="mx-auto w-full max-w-[380px]">
      <motion.div
        animate={{ backgroundColor: palette.bg, color: palette.fg }}
        transition={{ duration: 0.2 }}
        className="relative aspect-[9/16] w-full select-none overflow-hidden rounded-[2rem] shadow-2xl"
      >
        <div className="absolute inset-x-4 top-4 z-20 flex gap-1">
          {story.map((b, i) => (
            <div
              key={b.key}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white"
                style={{
                  width:
                    i < index
                      ? "100%"
                      : i > index
                        ? "0%"
                        : `${Math.min(100, (captionT / Math.max(speakSec, 0.1)) * 100)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <p className="absolute left-4 top-7 z-20 flex items-center gap-1.5 text-[11px] font-bold opacity-85">
          <Image src="/loggy/loggy-head.png" alt="" width={16} height={16} />
          WriteLogs
        </p>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={beat.key}
            className="absolute inset-0"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Hero beat={beat} palette={palette} />
            <Loggy beat={beat} />
            {started ? (
              <Captions
                caption={beat.caption}
                t={captionT}
                speakSec={speakSec}
                palette={palette}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        {last ? (
          <p className="absolute inset-x-0 bottom-4 z-20 text-center text-[11px] font-bold">
            {week.author_name ? `${week.author_name} · ` : ""}Get roasted at
            writelogs.com
          </p>
        ) : null}

        {voiced ? (
          <>
            {/* key = index remounts the element per slide, so it autoplays
                the new line without an effect. */}
            <audio
              key={index}
              src={src(index)}
              autoPlay={started}
              muted={muted}
              preload="auto"
              onLoadedMetadata={(e) => setAudioDur(e.currentTarget.duration)}
              onTimeUpdate={(e) => setAudioT(e.currentTarget.currentTime)}
              onEnded={() => setSpokenIndex(index)}
              onError={() => setSpokenIndex(index)}
            />
            {index + 1 < story.length ? (
              <link rel="prefetch" href={src(index + 1)} />
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => {
                setMuted((m) => !m);
                setStartedAt(Date.now());
              }}
              className="absolute right-2 top-5 z-30 size-8 text-current opacity-80 hover:bg-white/10 hover:text-current hover:opacity-100"
            >
              {muted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>
          </>
        ) : null}

        {/* The play overlay and the tap zones are unstyled hit areas over the
            whole story, not visible controls, so they stay plain buttons. */}
        {!started ? (
          <button
            type="button"
            onClick={() => {
              setStarted(true);
              setStartedAt(Date.now());
            }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/45 text-white backdrop-blur-sm"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white text-neutral-950">
              <Volume2 className="size-6" />
            </span>
            <span className="text-sm font-medium">Tap to play with sound</span>
            {persona ? (
              <span className="text-xs opacity-70">
                Narrated by {persona.name}
              </span>
            ) : null}
          </button>
        ) : null}

        <button
          type="button"
          aria-label="Previous"
          onClick={() => go(index - 1)}
          className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer"
        />
        <button
          type="button"
          aria-label="Next"
          onClick={() => go(index + 1)}
          className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-pointer"
        />
      </motion.div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={() => {
            setSpokenIndex(-1);
            go(0);
          }}
          className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
        >
          Replay
        </Button>
        <span className="tabular-nums">
          {index + 1} / {story.length}
        </span>
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
