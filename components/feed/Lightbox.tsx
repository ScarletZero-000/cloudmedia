"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle } from "lucide-react";

type LightboxPost = {
  id: string;
  slug?: string | null;
  url: string;
  title: string;
  author: { name: string | null };
  _count?: { likes: number; comments: number };
};

// Fullscreen image viewer: arrow keys / swipe navigation, Escape to close.
// Opens from feed cards without a page navigation.
export default function Lightbox({
  posts,
  index,
  onClose,
  onNavigate,
}: {
  posts: LightboxPost[];
  index: number | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const open = index !== null;
  const post = open ? posts[index] : null;

  const next = useCallback(() => {
    if (index === null || index >= posts.length - 1) return;
    onNavigate(index + 1);
  }, [index, posts.length, onNavigate]);

  const prev = useCallback(() => {
    if (index === null || index <= 0) return;
    onNavigate(index - 1);
  }, [index, onNavigate]);

  // keyboard nav + scroll lock while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, next, prev, onClose]);

  // touch swipe
  const [touchX, setTouchX] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {open && post && (
        <motion.div
          key="lb"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[95] flex flex-col bg-ink/95"
          role="dialog"
          aria-modal="true"
          aria-label={post.title}
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (dx > 60) prev();
            if (dx < -60) next();
            setTouchX(null);
          }}
        >
          {/* top bar */}
          <div className="flex items-center justify-between border-b border-paper/15 px-4 py-3">
            <Link
              href={`/post/${post.slug || post.id}`}
              className="min-w-0 truncate text-sm font-bold text-paper hover:text-accent"
              onClick={onClose}
            >
              {post.title}
            </Link>
            <button
              onClick={onClose}
              className="border-2 border-paper/30 p-1.5 text-paper transition-colors hover:border-paper"
              aria-label="Close viewer"
            >
              <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          {/* image */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
            {index > 0 && (
              <button
                onClick={prev}
                className="absolute left-2 z-10 border-2 border-paper/30 bg-ink/60 p-2 text-paper transition-colors hover:border-paper md:left-4"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            )}
            <motion.img
              key={post.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              src={post.url}
              alt={post.title}
              className="max-h-full max-w-full border-2 border-paper/20 object-contain"
              draggable={false}
            />
            {index < posts.length - 1 && (
              <button
                onClick={next}
                className="absolute right-2 z-10 border-2 border-paper/30 bg-ink/60 p-2 text-paper transition-colors hover:border-paper md:right-4"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            )}
          </div>

          {/* bottom meta */}
          <div className="flex items-center justify-center gap-4 border-t border-paper/15 py-3 text-xs text-paper/70">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {post._count?.likes ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {post._count?.comments ?? 0}
            </span>
            <span aria-hidden>·</span>
            <span>{post.author?.name ?? "Anonymous"}</span>
            {posts.length > 1 && (
              <>
                <span aria-hidden>·</span>
                <span className="font-mono">{(index ?? 0) + 1}/{posts.length}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
