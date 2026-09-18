import type { Metadata } from "next";

import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { DemoSection } from "./_components/demo";
import { ProblemSection } from "./_components/problem";
import { SolutionSection } from "./_components/solution";
import { EditorsSection } from "./_components/editors";
import { SetupSection } from "./_components/setup";
import { MeetSection } from "./_components/meet";
import { PricingSection } from "./_components/pricing";
import { Footer } from "./_components/footer";
import { getFoundingSeats } from "./service";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Structured data. The @graph ties three entities together — the company, the
 * site and the product — so Google can treat "WriteLogs" as one known thing
 * rather than three unrelated pages. That matters here because the name
 * collides with SQL Server's WRITELOG wait type and an unrelated contest
 * logging program, both of which have a long head start on the query.
 *
 * sameAs only lists profiles that actually resolve; pointing it at a missing
 * page weakens the association rather than strengthening it.
 */
const SITE = "https://www.writelogs.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "WriteLogs",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/loggy/favicon.png`,
        width: 1254,
        height: 1254,
      },
      description:
        "WriteLogs makes an editor extension that turns coding activity into daily work logs.",
      sameAs: [
        "https://x.com/usewritelogs",
        "https://www.producthunt.com/products/writelogs",
        "https://marketplace.visualstudio.com/items?itemName=IbrahimAliyu.writelogs",
        "https://open-vsx.org/extension/IbrahimAliyu/writelogs",
      ],
    },
    {
      "@type": "VideoObject",
      "@id": `${SITE}/#demo-video`,
      name: "WriteLogs, end to end",
      description:
        "A one-minute walkthrough: WriteLogs watches a coding session in VS Code, writes the day up, and has the summary open in the Google Meet side panel before standup starts.",
      thumbnailUrl: [
        "https://g7fmczfexytl55tg.public.blob.vercel-storage.com/demo/writelogs-demo-poster.webp",
      ],
      contentUrl:
        "https://g7fmczfexytl55tg.public.blob.vercel-storage.com/demo/writelogs-demo-1080.mp4",
      uploadDate: "2026-09-18",
      duration: "PT53S",
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "WriteLogs",
      url: SITE,
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE}/#app`,
      name: "WriteLogs",
      url: SITE,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Linux",
      description:
        "An extension for VS Code, Cursor, Antigravity, and Devin Desktop that watches what you build and writes your daily work log for you. Automatic coding summaries — no timers, no forms.",
      publisher: { "@id": `${SITE}/#organization` },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "8.00",
          priceCurrency: "USD",
        },
      ],
    },
  ],
};

export default async function LandingPage() {
  const seats = await getFoundingSeats();

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero seats={seats} />
      <DemoSection />
      <ProblemSection />
      <SolutionSection />
      <EditorsSection />
      <SetupSection />
      <MeetSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
