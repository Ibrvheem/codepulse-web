import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ClosingCta,
  FaqSection,
  Hero,
  JsonLd,
  PageShell,
  Prose,
  RelatedLinks,
  SampleLog,
  Section,
  Steps,
  faqJsonLd,
} from "../../_components/marketing";
import { EDITOR_PAGES, getEditorPage } from "./_lib/editor-pages";

/** Only the three slugs below exist; anything else is a 404, not a build. */
export const dynamicParams = false;

export function generateStaticParams() {
  return EDITOR_PAGES.map((page) => ({ editor: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ editor: string }>;
}): Promise<Metadata> {
  const { editor } = await params;
  const page = getEditorPage(editor);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/for/${page.slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `/for/${page.slug}`,
    },
  };
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ editor: string }>;
}) {
  const { editor } = await params;
  const page = getEditorPage(editor);
  if (!page) notFound();

  const related = [
    ...EDITOR_PAGES.filter((other) => other.slug !== page.slug).map((other) => ({
      href: `/for/${other.slug}`,
      title: `WriteLogs for ${other.name}`,
      note: `The same extension, set up in ${other.name}.`,
    })),
    {
      href: "/daily-standup-update",
      title: "How to write a daily standup update",
      note: "The three questions, and what a good answer sounds like.",
    },
  ];

  return (
    <PageShell>
      <JsonLd data={faqJsonLd(page.faqs)} />

      <Hero
        eyebrow={`WriteLogs for ${page.name}`}
        title={page.h1}
        subtitle={page.heroSubtitle}
        cta={{ href: page.installUrl, label: page.installLabel, external: true }}
      />

      <Section title={page.angleTitle} tone="muted">
        <Prose paragraphs={page.angleBody} />
      </Section>

      <Section title={`Setting it up in ${page.name}`}>
        <Steps items={page.steps} />
      </Section>

      <Section title="What comes out" tone="muted">
        <p className="mb-8 text-lg text-neutral-600 leading-relaxed">
          A day in {page.name}, written up without you touching anything.
        </p>
        <SampleLog lines={page.sampleLines} meta="Generated automatically" />
      </Section>

      <FaqSection items={page.faqs} />

      <RelatedLinks items={related} />

      <ClosingCta
        title={`Stop trying to remember your day.`}
        body={`Install WriteLogs in ${page.name}, paste a project key, and let the log write itself.`}
      />
    </PageShell>
  );
}
