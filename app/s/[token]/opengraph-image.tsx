import { ImageResponse } from "next/og";
import { formatDuration } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A WriteLogs daily summary";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9308";

async function loadGeist(weight: 400 | 600, text: string) {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=Geist:wght@${weight}&text=${encodeURIComponent(text)}`,
    )
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error("no font url");
  const res = await fetch(url);
  if (!res.ok) throw new Error("font fetch failed");
  return res.arrayBuffer();
}

async function loadLoggy(): Promise<string | null> {
  try {
    const res = await fetch("https://www.writelogs.com/loggy/loggy-head.png");
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let summary;
  try {
    const res = await fetch(`${API_URL}/summaries/shared/${token}`);
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error("not shared");
    summary = body.data;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const tasks = summary.tasks.slice(0, 4);
  const extra = summary.tasks.length - tasks.length;
  const date = new Date(summary.date)
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
  const stats: [string, string][] = [
    [String(summary.stats.commits), "COMMITS"],
    [String(summary.stats.files), "FILES"],
    [String(summary.stats.ai_changes), "AI CHANGES"],
    [summary.active_minutes >= 1 ? formatDuration(summary.active_minutes * 60_000) : "—", "ACTIVE"],
  ];

  const allText = `WriteLogs${summary.title}by ${summary.author_name}${date}${tasks.map((t: { task: string }) => t.task).join("")}${stats.flat().join("")}+${extra} more~0123456789hm `;
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 600 }[] = [];
  try {
    fonts.push({ name: "Geist", data: await loadGeist(400, allText), weight: 400 });
    fonts.push({ name: "Geist", data: await loadGeist(600, allText), weight: 600 });
  } catch {
    // fall back to the bundled default font
  }
  const loggy = await loadLoggy();

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
          fontFamily: fonts.length ? "Geist" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {loggy && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={loggy} alt="" width={52} height={54} />
            )}
            <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
              WriteLogs
            </span>
          </div>
          <span style={{ fontSize: 20, color: "#737373", letterSpacing: 2 }}>
            {date}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, marginTop: 40 }}>
          <span
            style={{
              fontSize: 48,
              fontWeight: 600,
              letterSpacing: -1.5,
              lineHeight: 1.3,
            }}
          >
            {summary.title.length > 90 ? `${summary.title.slice(0, 90)}…` : summary.title}
          </span>
          <span style={{ fontSize: 22, color: "#737373", marginTop: 10 }}>
            by {summary.author_name}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
            {tasks.map((task: { task: string; time_minutes: number }) => (
              <div key={task.task} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: "#404040" }} />
                <span style={{ fontSize: 24, flex: 1 }}>
                  {task.task.length > 70 ? `${task.task.slice(0, 70)}…` : task.task}
                </span>
                {task.time_minutes >= 1 && (
                  <span style={{ fontSize: 20, color: "#737373" }}>
                    ~{formatDuration(task.time_minutes * 60_000)}
                  </span>
                )}
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
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
