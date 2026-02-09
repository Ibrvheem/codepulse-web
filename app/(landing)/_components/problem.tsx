"use client";

import { motion } from "framer-motion";

export function ProblemSection() {
  return (
    <section className="py-28 lg:py-40 bg-neutral-900">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* The pain - relatable developer moment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-neutral-500 text-lg mb-6">
            5:30 PM. Standup tomorrow.
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.08] tracking-[-0.03em] mb-8">
            "What did I even
            <br />
            <span className="text-neutral-500">work on today?"</span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            You&apos;ve been coding for 8 hours. Now you&apos;re staring at a
            blank text box trying to remember which bugs you fixed, which
            features you shipped, and what&apos;s still in progress.
          </p>
        </motion.div>

        {/* The symptoms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 text-center"
        >
          <div>
            <p className="text-3xl font-semibold text-white mb-2">15 min</p>
            <p className="text-neutral-500">
              spent writing status updates daily
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-white mb-2">40%</p>
            <p className="text-neutral-500">of work goes unreported</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-white mb-2">Zero</p>
            <p className="text-neutral-500">
              visibility into your own patterns
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
