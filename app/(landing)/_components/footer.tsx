"use client";

import Link from "next/link";
import { Command, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Logo and tagline */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Command className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-neutral-900">WriteLogs</span>
            </Link>
            <p className="text-sm text-neutral-500">
              Automatic work logs for developers.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-neutral-600">
            <Link
              href="/waitlist"
              className="hover:text-neutral-900 transition-colors"
            >
              Waitlist
            </Link>
            <Link
              href="/signin"
              className="hover:text-neutral-900 transition-colors hidden"
            >
              Sign in
            </Link>
            <a
              href="https://twitter.com/writelogs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/writelogs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden hover:text-neutral-900 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} WriteLogs</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-neutral-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-neutral-600 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
