import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { ProblemSection } from "./_components/problem";
import { SolutionSection } from "./_components/solution";
import { PricingSection } from "./_components/pricing";
import { Footer } from "./_components/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
