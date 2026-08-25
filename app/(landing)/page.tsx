import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { ProblemSection } from "./_components/problem";
import { SolutionSection } from "./_components/solution";
import { PricingSection } from "./_components/pricing";
import { Footer } from "./_components/footer";
import { getFoundingSeats } from "./service";

export default async function LandingPage() {
  const seats = await getFoundingSeats();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero seats={seats} />
      <ProblemSection />
      <SolutionSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
