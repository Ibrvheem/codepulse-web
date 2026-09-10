"use client";

import { motion } from "framer-motion";

/**
 * The literal setup, on the public page. It previously lived only behind the
 * login, which meant "how much work is this?" got answered after signup
 * instead of before. Placed right after the editor picker, while the reader
 * is already thinking about installing.
 */
const STEPS = [
  {
    title: "Install the extension",
    body: "Search WriteLogs in your editor's Extensions panel, or pick your editor above and it opens there.",
  },
  {
    title: "Paste a project key",
    body: "Create a project, copy its key, and paste it into the WriteLogs sidebar. That is the whole configuration.",
  },
  {
    title: "Go back to work",
    body: "Nothing to start and nothing to fill in. Your first summary is waiting at the end of the day.",
  },
];

export function SetupSection() {
  return (
    <section id="setup" className="scroll-mt-14 py-28 lg:py-40 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.08] tracking-[-0.03em]">
            Two minutes, once.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-neutral-500 leading-relaxed max-w-xl mx-auto">
            Then you never think about it again. There is no daily ritual to
            keep up, which is the entire point.
          </p>
        </motion.div>

        <ol className="grid gap-12 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="min-w-0"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white tabular-nums">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-neutral-500 leading-relaxed">
                {step.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
