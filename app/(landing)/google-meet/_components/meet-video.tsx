"use client";

import { motion } from "framer-motion";

import { VideoPlayer } from "@/components/video-player";
import { MEET_POSTER, MEET_VIDEO } from "@/lib/videos";

export function MeetVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="max-w-5xl mx-auto px-6 lg:px-8"
    >
      <VideoPlayer
        src={MEET_VIDEO}
        poster={MEET_POSTER}
        title="WriteLogs in Google Meet"
        caption="1:11 · sound on"
      />
    </motion.div>
  );
}
