"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Heart, Eye, LoaderCircle } from "lucide-react";

// Like toggle + public view counter. Views increment once per hour per browser
// (cookie dedupe); likes require sign-in and toggle per user.
export default function LikeAndViewBar({
  postId,
  initialLikes,
  initialViews,
}: {
  postId: string;
  initialLikes: number;
  initialViews: number;
}) {
  const { status } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [views, setViews] = useState(initialViews);
  const [busy, setBusy] = useState(false);

  // fetch whether I liked it
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/posts/${postId}/like`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") setLikes(d.count);
        setLiked(Boolean(d.liked));
      })
      .catch(() => {});
  }, [postId, status]);

  // public view ping — once per hour per browser (server sets the cookie)
  useEffect(() => {
    fetch(`/api/posts/${postId}/view`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => typeof d.views === "number" && setViews(d.views))
      .catch(() => {});
  }, [postId]);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.status === 401) return; // not signed in — button hidden anyway
      const d = await res.json();
      if (typeof d.count === "number") setLikes(d.count);
      setLiked(Boolean(d.liked));
    } catch {
      // ignore transient errors
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status === "authenticated" ? (
        <button
          onClick={toggleLike}
          disabled={busy}
          aria-pressed={liked}
          className={`inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-xs font-bold transition-all ${
            liked
              ? "border-accent bg-accent text-paper shadow-[3px_3px_0_0_#0c0c0c]"
              : "border-ink bg-paper-raised text-ink hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#B3401E]"
          } disabled:opacity-60`}
          title={liked ? "Unlike" : "Like this post"}
        >
          {busy ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} aria-hidden />
          ) : (
            <Heart className="h-3.5 w-3.5" strokeWidth={2.5} fill={liked ? "currentColor" : "none"} aria-hidden />
          )}
          {likes}
        </button>
      ) : (
        <span
          className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper-raised px-3 py-1.5 text-xs font-bold text-ink"
          title="Sign in to like"
        >
          <Heart className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          {likes}
        </span>
      )}

      <span
        className="inline-flex items-center gap-1.5 border-2 border-line-strong bg-paper-raised px-3 py-1.5 text-xs font-bold text-ink-soft"
        title="Total views (public)"
      >
        <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        {views} views
      </span>
    </div>
  );
}
