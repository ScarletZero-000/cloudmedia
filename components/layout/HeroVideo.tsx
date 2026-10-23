"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero video, Clean Classic framing:
 * - thick solid black border on TOP only (border-t-4 border-ink)
 * - black pillarboxing on left/right (bg-ink + inner horizontal padding),
 *   so the video floats centered between black sides
 * - looped, muted, auto-playing, no controls
 */
export default function HeroVideo() {
  const reduce = useReducedMotion();

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="border-t-4 border-ink bg-ink mb-16"
      aria-label="Showreel"
    >
      {/* black pillarbox: horizontal padding on the ink background */}
      <div className="px-8 md:px-20 py-10">
        <video
          src="https://n.uguu.se/BtwgruWX.mp4"
          className="mx-auto aspect-video w-full max-w-4xl object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </motion.figure>
  );
}
