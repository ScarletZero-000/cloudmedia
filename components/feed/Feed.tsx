"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PostDTO } from "@/types";
import MediaCard from "@/components/feed/MediaCard";
import { ArrowDown, LoaderCircle } from "lucide-react";

export default function Feed({ initialPosts, initialCursor }: { initialPosts: PostDTO[]; initialCursor: string | null }) {
  const [posts, setPosts] = useState<PostDTO[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(!initialCursor);
  const reduce = useReducedMotion();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || done || !cursor) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?cursor=${cursor}&limit=12`);
      const data = await res.json();
      setPosts((p) => [...p, ...data.posts]);
      setCursor(data.nextCursor);
      if (!data.nextCursor) setDone(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cursor, done]);

  // IntersectionObserver instead of scroll listener:
  // fires off the main thread, doesn't jank scrolling on low-end phones.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || done) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "800px 0px" } // prefetch well before reaching the bottom
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, done]);

  return (
    <div className="container-classic py-16 md:py-24">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 max-w-2xl"
      >
        <p className="label-caps mb-4">The Collection</p>
        <h1 className="heading-classic text-4xl md:text-6xl">Media, curated &amp; shared.</h1>
        <p className="mt-5 text-ink-soft">
          Images and video from the community — grouped into albums, annotated with care, open to everyone.
        </p>
      </motion.div>

      {posts.length === 0 ? (
        <p className="text-ink-faint">Nothing here yet. Be the first to upload.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <MediaCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}

      {/* sentinel for infinite scroll */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      <div className="mt-16 flex justify-center">
        {loading ? (
          <span className="flex items-center gap-2 text-sm text-ink-faint">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> Loading
          </span>
        ) : done ? (
          <span className="flex items-center gap-2 label-caps">
            <ArrowDown className="h-3.5 w-3.5" aria-hidden /> End of feed
          </span>
        ) : (
          <button onClick={loadMore} className="btn-ghost">
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
