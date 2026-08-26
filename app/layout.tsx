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
  title: "WriteLogs",
  description: "Focus on code, not log sheets",
  openGraph: {
    siteName: "WriteLogs",
    type: "website",
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
