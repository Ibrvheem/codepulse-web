import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, Rocket } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-gray-300 animate-pulse">
            404
          </div>
        </div>

        {/* Main message */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>

        <p className="text-xl text-gray-600 mb-2">
          Looks like this page decided to take an unscheduled break.
        </p>

        <p className="text-lg text-gray-500 mb-8">
          We've checked the logs (ironically), and this page doesn't exist.
          <br />
          <span className="text-sm italic">
            Maybe it never did. Maybe it's a conspiracy.
          </span>
        </p>

        {/* Humorous suggestions */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">
            Here's what might have happened:
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li>• You typed a URL faster than our server could handle</li>
            <li>• The page is on a coffee break (it's earned it)</li>
            <li>• A developer deleted it and forgot to tell anyone</li>
            <li>• You've discovered a glitch in the matrix</li>
            <li>• The page moved and didn't leave a forwarding address</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
        </div>

        {/* Fun footer */}
        <div className="mt-12 text-sm text-gray-400">
          <p>Lost? Don't worry, we're tracking your confusion.</p>
          <p className="mt-1 text-xs">(That's... literally what we do here)</p>
        </div>
      </div>
    </div>
  );
}
