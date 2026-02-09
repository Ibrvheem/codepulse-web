import { Navbar } from "./(landing)/_components/navbar";
import { Hero } from "./(landing)/_components/hero";
import { ProblemSection } from "./(landing)/_components/problem";
import { SolutionSection } from "./(landing)/_components/solution";
import { PricingSection } from "./(landing)/_components/pricing";
import { Footer } from "./(landing)/_components/footer";

export default function Home() {
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
