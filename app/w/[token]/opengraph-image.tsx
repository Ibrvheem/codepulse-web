import { ImageResponse } from "next/og";
import { finalSlide, weekLabel } from "@/lib/week-roast";
import { personaFor } from "@/lib/week-personas";
import type { Week } from "@/lib/types";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A week on WriteLogs";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9308";
const FETCH_TIMEOUT = 2_500;
const DATA_TIMEOUT = 4_000;

let fontCache: { name: string; data: ArrayBuffer; weight: 600 }[] | null = null;

async function loadGeist() {
  if (fontCache) return fontCache;
  const css = await (
    await fetch("https://fonts.googleapis.com/css2?family=Geist:wght@600", {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    })
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error("no font url");
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  if (!res.ok) throw new Error("font fetch failed");
  fontCache = [{ name: "Geist", data: await res.arrayBuffer(), weight: 600 }];
  return fontCache;
}

/** The final slide as a wide card: the big number, the sting, the week. */
export default async function OgImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [weekResult, fontsResult] = await Promise.allSettled([
    (async () => {
      const res = await fetch(`${API_URL}/weeks/shared/${token}`, {
        signal: AbortSignal.timeout(DATA_TIMEOUT),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error("not shared");
      return body.data as Week;
    })(),
    loadGeist(),
  ]);
  if (weekResult.status !== "fulfilled") {
    return new Response("Not found", { status: 404 });
  }
  const week = weekResult.value;
  const fonts = fontsResult.status === "fulfilled" ? fontsResult.value : null;
  const final = finalSlide(week);
  const persona = personaFor(week.start);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: 72,
          fontFamily: fonts ? "Geist" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a3a3a3", letterSpacing: 2 }}>
          <span>{(week.author_name || "MY WEEK").toUpperCase()}</span>
          <span>{weekLabel(week).toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 168, fontWeight: 600, letterSpacing: -8, lineHeight: 1, color: "#D4FF3A" }}>
            {week.shipped}
          </span>
          <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1, marginTop: 8 }}>
            things shipped this week
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 28, color: "#d4d4d4" }}>
            {final.lines.slice(0, 2).map((line) => (
              <span key={line}>{line}</span>
            ))}
            <span style={{ color: "#D4FF3A", marginTop: 6 }}>Roasted by {persona.name}</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 600 }}>WriteLogs</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts ?? undefined,
      headers: {
        "cache-control": "public, no-transform, max-age=300, s-maxage=3600",
      },
    },
  );
}
