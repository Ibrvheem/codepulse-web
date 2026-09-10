import type { Metadata } from "next";

/** The add-on surfaces are private and framed by Meet; keep them out of search. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function MeetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-svh bg-background text-foreground">{children}</div>;
}
