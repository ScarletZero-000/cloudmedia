"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero image, Clean Classic framing:
 * - thick solid black border on TOP only (border-t-4 border-ink)
 * - black pillarboxing on left/right (bg-ink + inner horizontal padding)
 * - source image is square (736x736) — rendered square, sized responsively
 */
export default function HeroVideo() {
  const reduce = useReducedMotion();

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="border-t-4 border-ink bg-ink mb-16"
      aria-label="Featured"
    >
      {/* black pillarbox: horizontal padding on the ink background */}
      <div className="px-8 md:px-20 py-10">
        <Image
          src="/hero.jpg"
          alt="Featured image"
          width={736}
          height={736}
          priority
          className="mx-auto h-auto w-full max-w-xl"
          sizes="(min-width: 768px) 576px, calc(100vw - 64px)"
        />
      </div>
    </motion.figure>
  );
}
