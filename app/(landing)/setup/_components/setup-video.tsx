"use client";

import { motion } from "framer-motion";

import { VideoPlayer } from "@/components/video-player";

// Every video lives under the one demo/ prefix in the blob store.
const BLOB = "https://g7fmczfexytl55tg.public.blob.vercel-storage.com/demo";

export const HOWTO_VIDEO = `${BLOB}/writelogs-howto-1080.mp4`;
export const HOWTO_POSTER = `${BLOB}/writelogs-howto-poster.webp`;

export function SetupVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="max-w-5xl mx-auto px-6 lg:px-8"
    >
      <VideoPlayer
        src={HOWTO_VIDEO}
        poster={HOWTO_POSTER}
        title="Setting up WriteLogs"
        caption="1:26 · sound on"
      />
    </motion.div>
  );
}
