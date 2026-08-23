"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/loggy/loggy-error.png"
            alt="Loggy the mascot scratching his head over a crumpled log sheet"
            width={140}
            height={181}
            priority
          />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
          Well, this is awkward.
        </h1>
        <p className="text-muted-foreground mb-8">
          Something broke on our end. Loggy is looking into it — ironically,
          this is the one thing he didn&apos;t log.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="w-full sm:w-auto">
            Try again
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Back to dashboard
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
