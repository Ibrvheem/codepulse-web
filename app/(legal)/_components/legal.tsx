export function LegalTitle({
  children,
  updated,
}: {
  children: React.ReactNode;
  updated: string;
}) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-semibold tracking-tight">{children}</h1>
      <p className="mt-2 text-sm text-neutral-400">Last updated: {updated}</p>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-neutral-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </section>
  );
}
