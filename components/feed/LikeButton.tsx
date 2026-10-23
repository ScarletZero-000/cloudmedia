"use client";

import { useState } from "react";
import { Heart, LoaderCircle } from "lucide-react";

// Like toggle. Login required to actually like; signed-out visitors see the count.
export default function LikeButton({
  postId,
  initialLikes,
  initialLiked = false,
  compact = false,
}: {
  postId: string;
  initialLikes: number;
  initialLiked?: boolean;
  compact?: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    // optimistic update — snap back if the server disagrees
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setLiked(Boolean(d.liked));
      if (typeof d.count === "number") setLikes(d.count);
    } catch {
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      className={`inline-flex items-center gap-1.5 font-bold transition-all ${
        compact
          ? `text-[11px] ${liked ? "text-accent" : "text-ink-faint hover:text-accent"}`
          : `border-2 px-3 py-1.5 text-xs ${
              liked
                ? "border-accent bg-accent text-paper shadow-[3px_3px_0_0_#0c0c0c]"
                : "border-ink bg-paper-raised text-ink hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#B3401E]"
            }`
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
  );
}
