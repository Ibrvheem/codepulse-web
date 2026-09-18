"use client";

import { motion } from "framer-motion";

import { VideoPlayer } from "@/components/video-player";

const BLOB = "https://g7fmczfexytl55tg.public.blob.vercel-storage.com/demo";

export function DemoSection() {
  return (
    <section id="demo" className="scroll-mt-14 pb-24 lg:pb-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 lg:mb-14"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.08] tracking-[-0.03em]">
            Watch a day get written.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-neutral-500 leading-relaxed max-w-xl mx-auto">
            Under a minute, from the first file you open to the summary waiting
            in your standup.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <VideoPlayer
            src={`${BLOB}/writelogs-demo-1080.mp4`}
            poster={`${BLOB}/writelogs-demo-poster.webp`}
            title="WriteLogs, end to end"
            caption="53 seconds · sound on"
          />
        </motion.div>
      </div>
    </section>
  );
}
