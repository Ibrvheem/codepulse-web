import type { Metadata } from "next";

import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { ProblemSection } from "./_components/problem";
import { SolutionSection } from "./_components/solution";
import { PricingSection } from "./_components/pricing";
import { Footer } from "./_components/footer";
import { getFoundingSeats } from "./service";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Structured data so Google can show rich results for the product. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WriteLogs",
  url: "https://www.writelogs.com",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Windows, macOS, Linux",
  description:
    "A VS Code extension that watches what you build and writes your daily work log for you. Automatic coding summaries — no timers, no forms.",
  offers: {
    "@type": "Offer",
    price: "8.00",
    priceCurrency: "USD",
  },
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
      <ProblemSection />
      <SolutionSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
