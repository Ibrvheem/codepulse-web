"use client";

import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { EXTENSION_MARKETPLACE_URL } from "@/lib/config";

/** The X logo — lucide dropped brand icons, so this is inline. */
function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Logo and tagline */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/loggy/loggy-head.png"
                alt=""
                width={34}
                height={35}
              />
              <span className="font-semibold text-lg text-neutral-900">
                WriteLogs
              </span>
            </Link>
            <p className="text-sm text-neutral-500">
              Automatic work logs for developers.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-neutral-600">
            <a
              href={EXTENSION_MARKETPLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              VS Code extension
            </a>
            <Link
              href="/signup"
              className="hover:text-neutral-900 transition-colors"
            >
              Get started
            </Link>
            <Link
              href="/signin"
              className="hover:text-neutral-900 transition-colors"
            >
              Sign in
            </Link>
            <a
              href="https://x.com/usewritelogs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WriteLogs on X"
              className="hover:text-neutral-900 transition-colors"
            >
              <XLogo className="h-4 w-4" />
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
            <Link
              href="/refunds"
              className="hover:text-neutral-600 transition-colors"
            >
              Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
