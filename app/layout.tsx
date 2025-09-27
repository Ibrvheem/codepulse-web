import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";

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
  title: "WriteLogs",
  description: "Focus on code, not log sheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {process.env.NODE_ENV === "production" && <Analytics />}
        <Toaster />
        {children}
      </body>
    </html>
  );
}
