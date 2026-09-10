import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Faq } from "../types";

import { Navbar } from "./navbar";
import { Footer } from "./footer";

/**
 * Building blocks for the standalone marketing pages (editor pages, guides,
 * comparisons). Deliberately server-rendered with no entrance animations —
 * these pages are read, not scrolled through, and the content should be in
 * the HTML for crawlers without waiting on JS.
 */

export type { Faq };

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}

/** Structured data block. Next renders this into the page body. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function faqJsonLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function Hero({
  eyebrow,
  title,
  subtitle,
  cta,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  cta?: { href: string; label: string; external?: boolean };
}) {
  return (
    <section className="pt-32 pb-16 lg:pt-44 lg:pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {eyebrow ? (
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.05] tracking-[-0.035em]">
          {title}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-neutral-900 hover:bg-neutral-800 text-white h-14 px-8 text-base rounded-full"
            >
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          {cta ? (
            <a
              href={cta.href}
              target={cta.external ? "_blank" : undefined}
              rel={cta.external ? "noopener noreferrer" : undefined}
              className="text-[15px] font-medium text-neutral-900 hover:opacity-70 transition-opacity"
            >
              {cta.label} &rarr;
            </a>
          ) : null}
        </div>
        <p className="mt-6 text-sm text-neutral-400">
          Free plan forever. Pro trial included. No credit card required.
        </p>
      </div>
    </section>
  );
}

export function Section({
  title,
  tone = "white",
  children,
}: {
  title?: string;
  tone?: "white" | "muted";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`py-20 lg:py-28 ${
        tone === "muted" ? "bg-neutral-50" : "bg-white"
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {title ? (
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 leading-[1.12] tracking-[-0.03em] mb-8">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-5">
      {paragraphs.map((p) => (
        <p key={p} className="text-lg text-neutral-600 leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}

export function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className="space-y-8">
      {items.map((step, i) => (
        <li key={step.title} className="flex gap-5">
          <span className="shrink-0 flex size-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white tabular-nums">
            {i + 1}
          </span>
          <div className="min-w-0 pt-1">
            <p className="font-medium text-neutral-900">{step.title}</p>
            <p className="mt-1.5 text-neutral-500 leading-relaxed">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RuleList({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
      {items.map((item) => (
        <li key={item.title} className="py-6">
          <p className="font-medium text-neutral-900">{item.title}</p>
          <p className="mt-1.5 text-neutral-500 leading-relaxed">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** A example of the product's output, styled like the summary card on the home page. */
export function SampleLog({
  heading = "Today's summary",
  meta,
  lines,
}: {
  heading?: string;
  meta?: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs text-neutral-400">{heading}</p>
      <ul className="mt-4 space-y-3">
        {lines.map((line) => (
          <li key={line} className="flex gap-3 text-neutral-700 leading-relaxed">
            <span className="mt-2.5 size-1.5 rounded-full bg-neutral-300 shrink-0" />
            {line}
          </li>
        ))}
      </ul>
      {meta ? (
        <p className="mt-5 pt-4 border-t border-neutral-100 text-xs text-neutral-400">
          {meta}
        </p>
      ) : null}
    </div>
  );
}

export function FaqSection({ items }: { items: Faq[] }) {
  return (
    <Section title="Questions" tone="muted">
      <dl className="divide-y divide-neutral-200 border-t border-neutral-200">
        {items.map((item) => (
          <div key={item.q} className="py-6">
            <dt className="font-medium text-neutral-900">{item.q}</dt>
            <dd className="mt-2 text-neutral-500 leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function RelatedLinks({
  items,
}: {
  items: { href: string; title: string; note: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <Section title="Keep reading">
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex h-full items-start justify-between gap-3 rounded-xl border border-neutral-200 p-5 transition-colors hover:border-neutral-400"
            >
              <span className="min-w-0">
                <span className="block font-medium text-neutral-900">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm text-neutral-500">
                  {item.note}
                </span>
              </span>
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-900" />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function ClosingCta({ title, body }: { title: string; body: string }) {
  return (
    <section className="border-t border-neutral-200 bg-white py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-900 leading-[1.1] tracking-[-0.03em]">
          {title}
        </h2>
        <p className="mt-5 text-lg text-neutral-500 leading-relaxed max-w-xl mx-auto">
          {body}
        </p>
        <div className="mt-10">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-neutral-900 hover:bg-neutral-800 text-white h-14 px-8 text-base rounded-full"
            >
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-neutral-400">
          Free plan forever. Pro trial included. No credit card required.
        </p>
      </div>
    </section>
  );
}
