"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

import { EASE_OUT } from "@/components/motion/stagger-reveal";
import { slidesFor, type Slide } from "@/lib/week-roast";
import { personaById, personaFor } from "@/lib/week-personas";
import type { Week } from "@/lib/types";

const AUTO_ADVANCE_MS = 5000;

/**
 * One loud colour per slide, Wrapped-style. The story is the one place the
 * site is allowed to shout, so these stay here and out of the design tokens.
 */
type Palette = { bg: string; fg: string; shape: string; dark?: boolean };
const PALETTES: Record<string, Palette> = {
  intro: { bg: "#0a0a0a", fg: "#D4FF3A", shape: "#D4FF3A", dark: true },
  shipped: { bg: "#FF4D2E", fg: "#FFF4E8", shape: "#FFB199" },
  commit: { bg: "#FFD60A", fg: "#0a0a0a", shape: "#FFF1A6" },
  busiest: { bg: "#4B2AFF", fg: "#EDE9FF", shape: "#9D8BFF" },
  late: { bg: "#0a0a0a", fg: "#FF5CC8", shape: "#FF5CC8", dark: true },
  weekend: { bg: "#00C2A8", fg: "#06201C", shape: "#7FF5E2" },
  boundaries: { bg: "#00C2A8", fg: "#06201C", shape: "#7FF5E2" },
  file: { bg: "#FF7AB6", fg: "#2B0016", shape: "#FFC2DD" },
  areas: { bg: "#1D5BFF", fg: "#EAF0FF", shape: "#8FB0FF" },
  quiet: { bg: "#F2EFE6", fg: "#0a0a0a", shape: "#D9D2BE" },
  final: { bg: "#0a0a0a", fg: "#ffffff", shape: "#D4FF3A", dark: true },
};
const FALLBACK: Palette = PALETTES.final;

const SLAM = { type: "spring", duration: 0.7, bounce: 0.45 } as const;
const SLIDE_IN = { type: "spring", duration: 0.6, bounce: 0.2 } as const;

/** A number that counts up from 0 when its slide appears. */
function CountUp({ value, skip }: { value: number; skip: boolean }) {
  const mv = useMotionValue(skip ? value : 0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  const started = useRef(false);
  if (!started.current && !skip) {
    started.current = true;
    animate(mv, value, { duration: 0.9, ease: EASE_OUT });
  }
  return <motion.span>{rounded}</motion.span>;
}

function Hero({ slide, skip }: { slide: Slide; skip: boolean }) {
  const numeric = /^\d+$/.test(slide.hero);
  const long = slide.hero.length > 14;
  const size = numeric
    ? "text-[10rem] leading-[0.85]"
    : long
      ? "text-[2.6rem] leading-[1.02]"
      : "text-6xl leading-[0.95]";
  return (
    <motion.p
      initial={skip ? false : { scale: 2.4, opacity: 0, rotate: -6 }}
      animate={{ scale: 1, opacity: 1, rotate: numeric ? -3 : 0 }}
      transition={{ ...SLAM, delay: 0.1 }}
      className={`origin-left font-semibold tracking-[-0.05em] [overflow-wrap:anywhere] ${size}`}
    >
      {numeric ? (
        <CountUp value={Number(slide.hero)} skip={skip} />
      ) : (
        slide.hero
      )}
    </motion.p>
  );
}

function Shape({
  palette,
  skip,
  seed,
}: {
  palette: Palette;
  skip: boolean;
  seed: string;
}) {
  // Which blob a slide gets is fixed by its key, so a replay looks the same.
  const variant = seed.length % 3;
  const className =
    variant === 0
      ? "rounded-full"
      : variant === 1
        ? "rounded-[38%_62%_55%_45%/50%_40%_60%_50%]"
        : "rounded-[2rem]";
  return (
    <motion.div
      aria-hidden
      initial={skip ? false : { scale: 0, rotate: -40 }}
      animate={{ scale: 1, rotate: skip ? 0 : 360 }}
      transition={{
        scale: { ...SLAM, delay: 0.05 },
        rotate: skip
          ? { duration: 0 }
          : { duration: 28, ease: "linear", repeat: Infinity },
      }}
      className={`absolute -right-[32%] -top-[12%] size-[88%] ${className}`}
      // A tint on a light slide, a glow on a dark one.
      style={{ background: palette.shape, opacity: palette.dark ? 0.22 : 0.55 }}
    />
  );
}

function SlideView({
  slide,
  skip,
  palette,
}: {
  slide: Slide;
  skip: boolean;
  palette: Palette;
}) {
  const from = (i: number) => ({
    initial: skip ? false : { opacity: 0, x: 48 },
    animate: { opacity: 1, x: 0 },
    transition: { ...SLIDE_IN, delay: 0.35 + i * 0.14 },
  });
  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden px-7">
      <Shape palette={palette} skip={skip} seed={slide.key} />
      <div className="relative">
        {slide.eyebrow ? (
          <motion.p
            initial={skip ? false : { opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SLIDE_IN, delay: 0 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] opacity-70"
          >
            {slide.eyebrow}
          </motion.p>
        ) : null}
        <Hero slide={slide} skip={skip} />
        <div className="mt-7 space-y-2">
          {slide.lines.map((text, i) => (
            <motion.p
              key={text}
              {...from(i)}
              className={`font-medium leading-snug ${i === 0 ? "text-2xl" : "text-xl opacity-85"}`}
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}

// A clock the story reads while it plays. getSnapshot has to hand back the
// same value between ticks, so the interval writes into `tick` and the
// snapshot only reads it.
let tick = 0;
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

/**
 * The phone-shaped story. Tap the right side to advance, the left to go
 * back; it also advances on its own. The last slide is static and sits
 * still, because that is the one people screenshot.
 */
export function WeekStory({
  week,
  footer,
  audioBase,
  personaId,
}: {
  week: Week;
  /** Rendered under the final slide: share buttons, usually. */
  footer?: React.ReactNode;
  /**
   * Where the voice lives: `/api/narrate/<token>`. Slide N plays
   * `<audioBase>/N`. Without it the story is silent and runs on a timer.
   */
  audioBase?: string;
  /** Preview a character other than this week's. */
  personaId?: string;
}) {
  const persona =
    (personaId && personaById(personaId)) || personaFor(week.start);
  const slides = slidesFor(week, persona);
  const voiced = Boolean(audioBase && persona.voice_id);
  const reduceMotion = useReducedMotion() ?? false;
  // With a voice, the story waits for a tap: browsers only play audio after
  // a gesture, and a roast that starts on its own is just noise.
  const [started, setStarted] = useState(!voiced);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  // The slide whose audio has finished. Voiced slides hold until then.
  const [spokenIndex, setSpokenIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const last = index === slides.length - 1;
  const playing = started && !last;
  const now = useNow(playing);
  // `now` is 0 until the clock's first tick, on the server and on the first
  // client render alike, so both render the bar at 0% and hydration matches.
  const elapsed = playing && now > 0 ? Math.max(0, now - startedAt) : 0;
  const waitingForVoice = voiced && !muted && spokenIndex < index;

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    setIndex(clamped);
    setStartedAt(Date.now());
  };
  if (playing && elapsed >= AUTO_ADVANCE_MS && !waitingForVoice) {
    go(index + 1);
  }
  const start = () => {
    setStarted(true);
    setStartedAt(Date.now());
  };
  const src = (i: number) =>
    `${audioBase}/${i}${personaId ? `?persona=${personaId}` : ""}`;

  const slide = slides[index];
  const palette = PALETTES[slide.key] ?? FALLBACK;

  return (
    <div className="mx-auto w-full max-w-[380px]">
      <motion.div
        animate={{ backgroundColor: palette.bg, color: palette.fg }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="relative aspect-[9/16] w-full select-none overflow-hidden rounded-[2rem] shadow-2xl"
      >
        <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-4 pt-4">
          {slides.map((s, i) => (
            <div
              key={s.key}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-current opacity-90"
              style={{ backgroundColor: `${palette.fg}33` }}
            >
              <div
                className="h-full"
                style={{
                  backgroundColor: palette.fg,
                  width:
                    i < index
                      ? "100%"
                      : i === index
                        ? last
                          ? "100%"
                          : `${Math.min(100, (elapsed / AUTO_ADVANCE_MS) * 100)}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <p className="absolute left-6 top-9 z-20 text-[11px] font-semibold tracking-tight opacity-70">
          WriteLogs
        </p>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={slide.key}
            className="absolute inset-0"
            initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", duration: 0.55, bounce: 0.12 }}
          >
            <SlideView slide={slide} skip={reduceMotion} palette={palette} />
          </motion.div>
        </AnimatePresence>

        {last ? (
          <p className="absolute inset-x-0 bottom-6 z-20 text-center text-[11px] opacity-60">
            {week.author_name ? `${week.author_name} · ` : ""}writelogs.com
          </p>
        ) : null}

        {voiced ? (
          <>
            {/* key = index remounts the element per slide, so it autoplays
                the new line without an effect. */}
            <audio
              key={index}
              ref={audioRef}
              src={src(index)}
              autoPlay={started}
              muted={muted}
              preload="auto"
              onEnded={() => setSpokenIndex(index)}
              onError={() => setSpokenIndex(index)}
            />
            {index + 1 < slides.length ? (
              <link rel="prefetch" href={src(index + 1)} />
            ) : null}
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => setMuted((m) => !m)}
              className="absolute right-5 top-8 z-30 opacity-70 transition-opacity hover:opacity-100"
            >
              {muted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
          </>
        ) : null}

        {!started ? (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/40 text-white backdrop-blur-sm"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white text-neutral-950">
              <Volume2 className="size-6" />
            </span>
            <span className="text-sm font-medium">Tap to play with sound</span>
            <span className="text-xs opacity-70">
              Narrated by {persona.name}
            </span>
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
        <button
          type="button"
          onClick={() => {
            setSpokenIndex(-1);
            go(0);
          }}
          className="hover:text-foreground transition-colors"
        >
          Replay
        </button>
        <span className="tabular-nums">
          {index + 1} / {slides.length}
        </span>
      </div>

      {last && footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
