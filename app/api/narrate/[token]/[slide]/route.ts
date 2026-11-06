import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { weeks } from "@/lib/api-client";
import { personaById, personaOf } from "@/lib/week-personas";
import { slidesFor } from "@/lib/week-roast";
import {
  readTiming,
  readVoice,
  writeTiming,
  writeVoice,
  type WordTiming,
} from "@/lib/voice-store";

/**
 * The voice for one slide of a shared week, as MP3.
 *
 * Takes the week's share token rather than free text, so the only lines
 * anyone can have synthesised are lines a real week produced. The key stays
 * on the server. Every line is kept in R2 under a hash of its text, so it is
 * synthesised exactly once, ever; memory and the CDN are just faster paths.
 */

// A long line can take ElevenLabs 20 seconds or more; Vercel's default
// function limit is shorter than that and would cut the voice off.
export const maxDuration = 60;

const ELEVENLABS = "https://api.elevenlabs.io/v1/text-to-speech";
// Only v3 understands audio tags like [sighs]; older models read them aloud.
// v3 does not yet accept previous_text/next_text for continuity between
// lines, so each slide is read on its own at the "Natural" stability.
const MODEL = "eleven_v3";
const MAX_CACHE = 500;

const cache = new Map<string, ArrayBuffer>();

/** v3 accepts only three stability values. */
function v3Stability(value: number): 0 | 0.5 | 1 {
  return value < 0.4 ? 0 : value < 0.75 ? 0.5 : 1;
}

const EXTENSIONS: Record<string, string> = {
  py: "pie",
  ts: "T S",
  tsx: "T S X",
  js: "J S",
  jsx: "J S X",
  mjs: "M J S",
  json: "jason",
  md: "M D",
  css: "C S S",
  scss: "S C S S",
  html: "H T M L",
  sql: "sequel",
  yml: "yammel",
  yaml: "yammel",
  go: "go",
  rs: "R S",
  rb: "R B",
  java: "java",
  prisma: "prisma",
  env: "env",
};
const WORDS: Record<string, string> = {
  utils: "you-tils",
  util: "you-til",
  api: "A P I",
  ui: "U I",
  db: "D B",
  auth: "auth",
  config: "config",
  src: "source",
  tsx: "T S X",
};

/**
 * What the voice should say for a line. File names are written as they are
 * so the captions show them right; spoken raw, "utils.py" comes out as
 * "units". Here they become "you-tils dot pie", "pricing view dot T S X".
 */
function forVoice(text: string): string {
  return text.replace(
    /\b([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)\.([A-Za-z]{1,6})\b/g,
    (whole, name: string, ext: string) => {
      const spokenExt = EXTENSIONS[ext.toLowerCase()];
      if (!spokenExt) return whole;
      const words = name
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map((w) => WORDS[w.toLowerCase()] ?? w);
      return `${words.join(" ")} dot ${spokenExt}`;
    },
  );
}

/**
 * Spoken words with their times, from ElevenLabs' per-character alignment.
 * Audio tags like [sighs] are performed, not said, so they are skipped.
 */
function wordsFrom(alignment: {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}): WordTiming[] {
  const words: WordTiming[] = [];
  let text = "";
  let start = 0;
  let end = 0;
  let inTag = false;
  const flush = () => {
    if (text) words.push({ text, start, end });
    text = "";
  };
  alignment.characters.forEach((ch, i) => {
    if (ch === "[") inTag = true;
    if (inTag) {
      if (ch === "]") inTag = false;
      flush();
      return;
    }
    if (/\s/.test(ch)) return flush();
    if (!text) start = alignment.character_start_times_seconds[i];
    text += ch;
    end = alignment.character_end_times_seconds[i];
  });
  flush();
  return words;
}

const timings = new Map<string, WordTiming[]>();

function remember(key: string, audio: ArrayBuffer, words?: WordTiming[]) {
  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest) {
      cache.delete(oldest);
      timings.delete(oldest);
    }
  }
  cache.set(key, audio);
  if (words) timings.set(key, words);
}

/**
 * A line's audio and, when asked for, when each word is said. Both are
 * synthesised together and stored together, so the timings always match
 * the exact audio that plays. Lines stored before timings existed are
 * synthesised again the first time their timings are wanted.
 */
async function synthesise(
  voiceId: string,
  text: string,
  stability: number,
  needTiming = false,
): Promise<{ audio: ArrayBuffer; words: WordTiming[] | null }> {
  // The voice reads file names its own way; the key follows what is said.
  text = forVoice(text);
  const key = createHash("sha1").update(`${voiceId}:${text}`).digest("hex");
  const hit = cache.get(key);
  if (hit && (!needTiming || timings.has(key))) {
    return { audio: hit, words: timings.get(key) ?? null };
  }
  // Paid for once: anything synthesised before is in R2 under its hash.
  const [stored, storedWords] = await Promise.all([
    readVoice(key),
    readTiming(key),
  ]);
  if (stored && (!needTiming || storedWords)) {
    remember(key, stored, storedWords ?? undefined);
    return { audio: stored, words: storedWords };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");
  const res = await fetch(
    `${ELEVENLABS}/${voiceId}/with-timestamps?output_format=mp3_44100_192`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: {
          stability: v3Stability(stability),
          similarity_boost: 0.85,
        },
      }),
      signal: AbortSignal.timeout(40_000),
    },
  );
  if (!res.ok) {
    throw new Error(
      `ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  }
  const body = (await res.json()) as {
    audio_base64: string;
    alignment?: Parameters<typeof wordsFrom>[0];
  };
  const bytes = Buffer.from(body.audio_base64, "base64");
  const audio = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(audio).set(bytes);
  const words = body.alignment ? wordsFrom(body.alignment) : [];
  await Promise.all([writeVoice(key, audio), writeTiming(key, words)]);
  remember(key, audio, words);
  return { audio, words };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; slide: string }> },
) {
  const { token, slide } = await params;
  const index = Number(slide);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Bad slide" }, { status: 400 });
  }

  let week;
  try {
    week = await weeks.shared(token);
  } catch {
    return NextResponse.json({ error: "Not shared" }, { status: 404 });
  }

  // `persona` lets the dashboard preview a character that isn't this
  // week's; the share page never passes it.
  const override = new URL(request.url).searchParams.get("persona");

  // Hook-format roasts: the API built the slides and names the voice.
  let voiceId: string | undefined;
  let stability: number;
  let speech: string | undefined;
  if (week.story && week.persona && !override) {
    voiceId = week.persona.voice_id ?? undefined;
    stability = week.persona.stability;
    speech = week.story[index]?.speech;
  } else {
    const persona = (override && personaById(override)) || personaOf(week);
    voiceId = persona.voice_id;
    stability = persona.delivery.stability;
    speech = slidesFor(week, persona)[index]?.speech;
  }
  if (!voiceId) {
    return NextResponse.json({ error: "No voice yet" }, { status: 404 });
  }
  if (!speech) {
    return NextResponse.json({ error: "No such slide" }, { status: 404 });
  }

  try {
    // `?timing=1`: when each word is said, for captions that keep pace.
    const wantTiming = new URL(request.url).searchParams.get("timing") === "1";
    const { audio, words } = await synthesise(
      voiceId,
      speech,
      stability,
      wantTiming,
    );
    if (wantTiming) {
      return NextResponse.json(
        { words: words ?? [] },
        {
          headers: {
            "Cache-Control":
              "public, max-age=86400, s-maxage=604800, immutable",
          },
        },
      );
    }
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      },
    });
  } catch (error) {
    console.error("narrate failed", error);
    return NextResponse.json({ error: "Voice unavailable" }, { status: 502 });
  }
}
