"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { VideoPlayer } from "@/components/video-player";
import { MEET_ADDON_URL } from "@/lib/meet-addon";
import { MEET_POSTER, MEET_VIDEO } from "@/lib/videos";

const POINTS = [
  {
    title: "Open before you are",
    detail:
      "Yesterday's summary is in the side panel when the call starts. Nothing to search for, nothing to remember.",
  },
  {
    title: "Every project",
    detail:
      "Switch between projects in the panel, mid-call, if your standup covers more than one.",
  },
  {
    title: "One click to paste",
    detail:
      "Copy the standup version and drop it in the meeting chat or your team's channel.",
  },
];

export function MeetSection() {
  return (
    <section id="meet" className="scroll-mt-14 py-28 lg:py-40">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 lg:mb-14"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-[1.08] tracking-[-0.03em]">
            Ready before the call starts.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-neutral-500 leading-relaxed max-w-xl mx-auto">
            Add WriteLogs to Google Meet and your daily log is in the side panel,
            waiting, every standup. Here is the whole setup, end to end.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          <VideoPlayer
            src={MEET_VIDEO}
            poster={MEET_POSTER}
            title="WriteLogs in Google Meet"
            caption="1:11 · sound on"
          />
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <p className="font-medium text-neutral-900">{point.title}</p>
              <p className="mt-1.5 text-neutral-500 leading-relaxed">
                {point.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5">
          <a
            href={MEET_ADDON_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center h-12 px-7 bg-neutral-900 text-white font-medium rounded-lg transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            Add WriteLogs to Meet
          </a>
          <Link
            href="/google-meet"
            className="text-[15px] font-medium text-neutral-900 hover:opacity-70 transition-opacity"
          >
            How the add-on works &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
