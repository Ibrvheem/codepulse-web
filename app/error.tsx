"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home, Search } from "lucide-react";

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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Animated error icon */}
        <div className="mb-8 relative">
          <div className="inline-block animate-bounce">
            <AlertTriangle className="w-32 h-32 text-red-500" />
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Well, this is awkward...
        </h1>

        <p className="text-xl text-gray-600 mb-2">
          Something went wrong. Like, really wrong.
        </p>

        <p className="text-lg text-gray-500 mb-8">
          We tried to track what happened, but ironically, our tracking failed
          too.
          <br />
          <span className="text-sm italic">
            (We promise we're better at tracking your code than our own bugs)
          </span>
        </p>

        {/* Error details (collapsed by default) */}
        <details className="mb-8 text-left bg-white rounded-lg p-6 shadow-sm">
          <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Technical details (for the curious)
          </summary>
          <div className="mt-4 text-sm text-gray-600 font-mono bg-gray-50 p-4 rounded overflow-auto max-h-40">
            {error.message || "Unknown error occurred"}
            {error.digest && (
              <div className="mt-2 text-xs text-gray-400">
                Error ID: {error.digest}
              </div>
            )}
          </div>
        </details>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={reset}
            size="lg"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Try Again
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Humorous footer */}
        <div className="mt-12 text-sm text-gray-400">
          <p>
            Fun fact: This error page has been viewed{" "}
            {Math.floor(Math.random() * 42 + 1)} time
            {Math.floor(Math.random() * 42 + 1) === 1 ? "" : "s"} today.
          </p>
          <p className="mt-2">(We may or may not be making that up)</p>
        </div>
      </div>
    </div>
  );
}
