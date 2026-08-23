import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/loggy/loggy-error.png"
            alt="Loggy the mascot scratching his head over a crumpled log sheet"
            width={140}
            height={181}
            priority
          />
          <p className="text-5xl font-bold text-muted-foreground/40 tabular-nums">
            404
          </p>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          We checked the logs — ironically, this page doesn&apos;t exist. Maybe
          it never did.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full">Back to dashboard</Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
