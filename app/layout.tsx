import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata configuration for the WriteLogs application.
 *
 * WriteLogs quietly watches your coding rhythm and turns it into simple,
 * human-friendly summaries. No timers, no fiddly forms. Sign up as a solo
 * engineer or on behalf of your organisation and we’ll save you a spot in
 * the early release.
 *
 * @remarks
 * This metadata is used for setting the application's title and description.
 */
export const metadata: Metadata = {
  // www is the canonical host — the apex 307s, and X's card crawler
  // won't reliably follow redirects for images.
  metadataBase: new URL("https://www.writelogs.com"),
  // Every page title carries the standup tagline so the brand and the search
  // term travel together; pages set `title: { absolute }` to opt out.
  title: {
    default: "WriteLogs: Daily Standup Notes & AI Work Logs for VS Code and Cursor",
    template: "%s | WriteLogs: Daily Standup Notes & AI Work Logs",
  },
  description:
    "An extension for VS Code, Cursor, Antigravity, and Devin Desktop that watches what you build and writes your daily work log for you. Automatic coding summaries — no timers, no forms, no log sheets.",
  keywords: [
    "daily standup",
    "standup notes",
    "standup update generator",
    "AI notes for developers",
    "AI daily summary",
    "automatic work log",
    "developer work log",
    "dev journal",
    "daily report for developers",
    "coding activity tracker",
    "git commit summary",
    "WakaTime alternative",
    "Google Meet standup add-on",
    "VS Code extension",
    "Cursor extension",
    "Claude Code",
  ],
  openGraph: {
    siteName: "WriteLogs",
    type: "website",
    title: "WriteLogs: Daily Standup Notes & AI Work Logs for VS Code and Cursor",
    description:
      "An extension for VS Code, Cursor, Antigravity, and Devin Desktop that watches what you build and writes your daily work log for you.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@usewritelogs",
    creator: "@usewritelogs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
        <Providers>
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
