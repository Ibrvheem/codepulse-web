import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { weeks } from "@/lib/api-client";
import { personaById, personaFor } from "@/lib/week-personas";
import { slidesFor } from "@/lib/week-roast";
import { readVoice, writeVoice } from "@/lib/voice-store";

/**
 * The voice for one slide of a shared week, as MP3.
 *
 * Takes the week's share token rather than free text, so the only lines
 * anyone can have synthesised are lines a real week produced. The key stays
 * on the server. Every line is kept in R2 under a hash of its text, so it is
 * synthesised exactly once, ever; memory and the CDN are just faster paths.
 */

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

async function synthesise(
  voiceId: string,
  text: string,
  stability: number,
): Promise<ArrayBuffer> {
  const key = createHash("sha1").update(`${voiceId}:${text}`).digest("hex");
  const hit = cache.get(key);
  if (hit) return hit;
  // Paid for once: anything synthesised before is in R2 under its hash.
  const stored = await readVoice(key);
  if (stored) {
    cache.set(key, stored);
    return stored;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");
  const res = await fetch(
    `${ELEVENLABS}/${voiceId}?output_format=mp3_44100_192`,
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
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!res.ok) {
    throw new Error(
      `ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  }
  const audio = await res.arrayBuffer();
  await writeVoice(key, audio);
  if (cache.size >= MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, audio);
  return audio;
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
  const persona = (override && personaById(override)) || personaFor(week.start);
  if (!persona.voice_id) {
    return NextResponse.json({ error: "No voice yet" }, { status: 404 });
  }
  const slides = slidesFor(week, persona);
  const current = slides[index];
  if (!current) {
    return NextResponse.json({ error: "No such slide" }, { status: 404 });
  }

  try {
    const audio = await synthesise(
      persona.voice_id,
      current.speech,
      persona.delivery.stability,
    );
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
