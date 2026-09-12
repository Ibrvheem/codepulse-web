import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A WriteLogs multi-day recap";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9308";
const FETCH_TIMEOUT = 2_500;
// The card can render without the font or the mascot, but not without the
// data — so the API gets a longer budget than the decorations. Everything
// runs in parallel, so the worst case is still inside the crawler's ~5s.
const DATA_TIMEOUT = 4_000;

// X's crawler gives up around 5s, so everything here is parallel, capped,
// and cached at module level (warm lambdas skip the font/mascot fetches).
let fontCache: { name: string; data: ArrayBuffer; weight: 400 | 600 }[] | null =
  null;
let loggyCache: string | null | undefined;

async function loadGeist() {
  if (fontCache) return fontCache;
  const weight = async (w: 400 | 600) => {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${w}`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) throw new Error("no font url");
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) throw new Error("font fetch failed");
    return { name: "Geist", data: await res.arrayBuffer(), weight: w };
  };
  fontCache = await Promise.all([weight(400), weight(600)]);
  return fontCache;
}

async function loadLoggy(): Promise<string | null> {
  if (loggyCache !== undefined) return loggyCache;
  try {
    const res = await fetch("https://www.writelogs.com/loggy/loggy-head.png", {
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!res.ok) throw new Error("loggy fetch failed");
    const buf = Buffer.from(await res.arrayBuffer());
    loggyCache = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    loggyCache = null;
  }
  return loggyCache;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "SEP 7 – 11, 2026" — the card's eyebrow, uppercase like the daily one.
 * Built by hand rather than with Intl: the shared "Sep 7 – 11" form drops the
 * month from the right-hand date, which no single locale format produces.
 */
function spanLabel(start: string, end: string): string {
  const from = new Date(start);
  const to = new Date(end);
  const sameYear = from.getUTCFullYear() === to.getUTCFullYear();
  const sameMonth = sameYear && from.getUTCMonth() === to.getUTCMonth();
  const left = `${MONTHS[from.getUTCMonth()]} ${from.getUTCDate()}${
    sameYear ? "" : `, ${from.getUTCFullYear()}`
  }`;
  const right = sameMonth
    ? `${to.getUTCDate()}, ${to.getUTCFullYear()}`
    : `${MONTHS[to.getUTCMonth()]} ${to.getUTCDate()}, ${to.getUTCFullYear()}`;
  return `${left} – ${right}`.toUpperCase();
}

// Satori will not measure a wrapped text node: it reports one line, then
// paints the rest on top of whatever follows. Rather than fight that, the
// title always occupies exactly one line — it just gets the smaller size when
// it is long. The rest of the card then keeps the spacing it was designed
// with, four bullets and all. Character counts are for Geist SemiBold across
// the 1072px content width.
const TITLE_LARGE = { fontSize: 48, maxChars: 42 };
const TITLE_SMALL = { fontSize: 36, maxChars: 58 };
const TITLE_BOX_HEIGHT = Math.round(TITLE_LARGE.fontSize * 1.3);

/** One line of title: the size that fits it, ellipsized only if truly long. */
function fitTitle(title: string): { text: string; fontSize: number } {
  const trimmed = title.trim();
  if (trimmed.length <= TITLE_LARGE.maxChars) {
    return { text: trimmed, fontSize: TITLE_LARGE.fontSize };
  }
  const text =
    trimmed.length > TITLE_SMALL.maxChars
      ? `${trimmed.slice(0, TITLE_SMALL.maxChars - 1).trimEnd()}…`
      : trimmed;
  return { text, fontSize: TITLE_SMALL.fontSize };
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [recapResult, fontsResult, loggy] = await Promise.allSettled([
    (async () => {
      const res = await fetch(`${API_URL}/recaps/shared/${token}`, {
        signal: AbortSignal.timeout(DATA_TIMEOUT),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error("not shared");
      return body.data;
    })(),
    loadGeist(),
    loadLoggy(),
  ]).then((r) => [
    r[0].status === "fulfilled" ? r[0].value : null,
    r[1].status === "fulfilled" ? r[1].value : null,
    r[2].status === "fulfilled" ? r[2].value : null,
  ]);

  if (!recapResult) return new Response("Not found", { status: 404 });
  const recap = recapResult;
  const fonts = fontsResult;

  const { text: title, fontSize: titleFontSize } = fitTitle(recap.title);
  const tasks = recap.tasks.slice(0, 4);
  const extra = recap.tasks.length - tasks.length;
  const byline = [
    recap.author_name ? `by ${recap.author_name}` : null,
    `${recap.days_count} ${recap.days_count === 1 ? "day" : "days"} of work`,
  ]
    .filter(Boolean)
    .join(" · ");
  const stats: [string, string][] = [
    [String(recap.stats.commits), "COMMITS"],
    [String(recap.stats.files), "FILES"],
    [String(recap.stats.ai_changes), "CHANGES"],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#0a0a0a",
          padding: 64,
          fontFamily: fonts ? "Geist" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {loggy && <img src={loggy} alt="" width={52} height={54} />}
            <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
              WriteLogs
            </span>
          </div>
          <span style={{ fontSize: 20, color: "#737373", letterSpacing: 2 }}>
            {spanLabel(recap.start_date, recap.end_date)}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, marginTop: 40 }}>
          {/* Satori measures a wrapping text node as ONE line and then paints
              the second line over whatever follows, and it honours neither
              line-clamp nor the wrap in its height. So the height is reserved
              explicitly — see fitTitle. */}
          <div
            style={{
              display: "flex",
              height: TITLE_BOX_HEIGHT,
              // The parent column is flex:1, so its children shrink by
              // default — without this the box collapses under the text and
              // the title paints over the byline.
              flexShrink: 0,
              alignItems: "center",
              fontSize: titleFontSize,
              fontWeight: 600,
              letterSpacing: -1.5,
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
          <span style={{ fontSize: 22, color: "#737373", marginTop: 10 }}>
            {byline}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
            {tasks.map((task: { task: string; time_minutes: number }) => (
              <div key={task.task} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: "#404040" }} />
                <span style={{ fontSize: 24 }}>
                  {task.task.length > 70 ? `${task.task.slice(0, 70)}…` : task.task}
                </span>
              </div>
            ))}
            {extra > 0 && (
              <span style={{ fontSize: 20, color: "#737373", marginLeft: 22 }}>
                +{extra} more
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 72,
            borderTop: "1px solid #e5e5e5",
            paddingTop: 28,
          }}
        >
          {stats.map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 30, fontWeight: 600 }}>{value}</span>
              <span style={{ fontSize: 15, color: "#737373", letterSpacing: 2 }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts ?? undefined,
      headers: {
        // Let the CDN absorb crawler retries; a re-shared link gets a new token.
        "cache-control": "public, no-transform, max-age=300, s-maxage=3600",
      },
    },
  );
}
