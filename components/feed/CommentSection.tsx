"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MessageCircle, SendHorizonal, LoaderCircle } from "lucide-react";

type CommentDTO = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null };
};

export default function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentDTO[] | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const firstRender = useRef(true);

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => setComments([]));
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not post comment");
      setComments((c) => [...(c ?? []), data.comment]);
      setBody("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-line py-12">
      <div className="mb-8 flex items-center gap-2">
        <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        <h2 className="label-caps">Comments</h2>
      </div>

      {comments === null ? (
        <p className="text-sm text-ink-faint">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-faint">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="divide-y divide-line">
          {comments.map((c, i) => (
            <motion.li
              key={c.id}
              initial={firstRender.current ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              className="py-5 first:pt-0 last:pb-0"
            >
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-medium">{c.author.name ?? "Anonymous"}</span>
                <time className="text-xs text-ink-faint" dateTime={c.createdAt}>
                  {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </time>
              </div>
              <p className="text-[15px] leading-relaxed text-ink-soft">{c.body}</p>
            </motion.li>
          ))}
        </ul>
      )}

      {session ? (
        <form onSubmit={submit} className="mt-10">
          <label htmlFor="comment" className="label-caps mb-2 block">Leave a comment</label>
          <textarea
            id="comment"
            rows={3}
            className="input-classic resize-y"
            value={body}
            maxLength={2000}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write something thoughtful…"
          />
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="btn-classic disabled:pointer-events-none disabled:opacity-40"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <SendHorizonal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              )}
              Post comment
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-10 text-sm text-ink-faint">
          Sign in to join the discussion.
        </p>
      )}
    </section>
  );
}
