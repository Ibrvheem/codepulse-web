"use client";

import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";

import { EDITOR_PAGES } from "../for/[editor]/_lib/editor-pages";

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

const PRODUCT_LINKS = [
  { href: "/#get-extension", label: "Get the extension" },
  { href: "/setup", label: "Watch the setup" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/signup", label: "Get started" },
  { href: "/signin", label: "Sign in" },
];

// Editor pages come from the same source as the routes and the sitemap, so a
// new editor page shows up here without a second edit.
const EDITOR_LINKS = EDITOR_PAGES.map((page) => ({
  href: `/for/${page.slug}`,
  label: page.name,
}));

const GUIDE_LINKS = [
  { href: "/daily-standup-update", label: "Daily standup updates" },
  { href: "/wakatime-alternative", label: "WriteLogs vs WakaTime" },
  { href: "/automate-daily-standup", label: "Automate your daily standup" },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
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
            <p className="text-sm text-neutral-500 max-w-[22rem]">
              Automatic work logs for developers.
            </p>
            <div className="mt-2 flex items-center gap-4 text-neutral-500">
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
                aria-label="WriteLogs on GitHub"
                className="hidden hover:text-neutral-900 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          <LinkColumn title="Product" links={PRODUCT_LINKS} />
          <LinkColumn title="Editors" links={EDITOR_LINKS} />
          <LinkColumn title="Guides" links={GUIDE_LINKS} />
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} WriteLogs</p>
          <div className="flex items-center gap-6">
            <Link
              href="/support"
              className="hover:text-neutral-600 transition-colors"
            >
              Support
            </Link>
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
