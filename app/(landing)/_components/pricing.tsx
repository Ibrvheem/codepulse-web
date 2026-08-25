"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { EXTENSION_MARKETPLACE_URL } from "@/lib/config";

// Rows line up across the two cards: projects, history, updates, then extras.
const FREE_FEATURES = [
  "1 project",
  "Last 7 days of summaries",
  "1 manual update a day",
  "Captures changes from AI tools like Claude Code",
];

const PRO_FEATURES = [
  "Unlimited projects",
  "Full history",
  "3 manual updates a day",
  "Captures changes from AI tools like Claude Code",
  "Copy as standup — your day as a paste-ready update for Slack or standup",
  "Both voices — “you” and “I”",
];

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-14 py-28 lg:py-40">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.08] tracking-[-0.03em] mb-6">
            Free to start.
            <br />
            <span className="text-neutral-400">Pro when it earns it.</span>
          </h2>
          <p className="text-xl text-neutral-500 max-w-xl mx-auto">
            Every new account gets a Pro trial. No credit card to begin.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Free */}
          <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-8 flex flex-col">
            <p className="text-sm font-medium text-neutral-500">Free</p>
            <p className="mt-2 text-4xl font-semibold text-neutral-900 tracking-tight">
              $0
            </p>
            <p className="mt-1 text-sm text-neutral-500">forever</p>
            <ul className="mt-8 space-y-3 text-neutral-700 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2.5 size-1.5 rounded-full bg-neutral-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-8">
              <Button
                size="lg"
                variant="outline"
                // The landing page is always light; don't let the .dark
                // theme tokens turn this into dark-on-dark.
                className="w-full h-12 rounded-full border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-300 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                Get started free
              </Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="min-w-0 rounded-2xl border border-neutral-900 bg-neutral-900 text-white p-8 flex flex-col">
            <p className="text-sm font-medium text-neutral-400">Pro</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">
              $8
              <span className="text-lg font-normal text-neutral-400">/mo</span>
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              or $6/mo billed yearly ($72)
            </p>
            <ul className="mt-8 space-y-3 text-neutral-200 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2.5 size-1.5 rounded-full bg-neutral-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-8">
              <Button
                size="lg"
                className="w-full h-12 rounded-full bg-white text-neutral-900 hover:bg-neutral-200"
              >
                Start your Pro trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <p className="mt-10 text-center text-sm text-neutral-400">
          No credit card. No setup. Just{" "}
          <a
            href={EXTENSION_MARKETPLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-neutral-700 transition-colors"
          >
            install the extension
          </a>
          .
        </p>
      </div>
    </section>
  );
}
