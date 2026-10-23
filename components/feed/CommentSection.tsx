"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog, { type ConfirmState } from "@/components/ui/ConfirmDialog";
import { MessageCircle, SendHorizonal, LoaderCircle, Trash2, CornerDownRight, BadgeCheck, X, ImagePlus } from "lucide-react";

type CommentDTO = {
  id: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  parentId: string | null;
  author: { id: string; name: string | null; image: string | null; role: string };
};

export default function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const me = session?.user as { id?: string; role?: string } | undefined;
  const [comments, setComments] = useState<CommentDTO[] | null>(null);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [error, setError] = useState("");
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const load = () =>
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => setComments([]));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const roots = (comments ?? []).filter((c) => !c.parentId);
  const repliesOf = (id: string) => (comments ?? []).filter((c) => c.parentId === id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && !pendingImage) return;
    setSubmitting(true);
    setError("");
    try {
      let imageUrl: string | undefined;
      if (pendingImage) {
        setUploadingImage(true);
        const fd = new FormData();
        fd.append("file", pendingImage);
        const up = await fetch("/api/comments/image", { method: "POST", body: fd });
        setUploadingImage(false);
        if (!up.ok) {
          const d = await up.json().catch(() => ({}));
          throw new Error(d.error ?? "Image upload failed");
        }
        imageUrl = (await up.json()).url;
      }
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, body, parentId: replyTo?.id ?? null, ...(imageUrl && { imageUrl }) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not post comment");
      setComments((c) => [...(c ?? []), data.comment]);
      setBody("");
      setPendingImage(null);
      setImagePreview(null);
      setReplyTo(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function remove(id: string) {
    setConfirmState({
      title: "Delete this comment?",
      body: repliesOf(id).length ? "Its replies are removed too." : undefined,
      confirmLabel: "Delete", danger: true,
      onConfirm: async () => {
        setDeletingId(id);
        try {
          const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Delete failed");
          setComments((c) => (c ?? []).filter((x) => x.id !== id && x.parentId !== id));
        } catch (e: any) {
          setError(e.message);
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  function startReply(c: CommentDTO) {
    setReplyTo({ id: c.id, name: c.author.name ?? "Anonymous" });
    setError("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const avatar = (c: CommentDTO, size = "h-8 w-8") => (
    <span className={`${size} shrink-0 overflow-hidden rounded-full border-2 border-ink bg-paper-dim`}>
      {c.author.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.author.image} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-ink-faint">
          {(c.author.name ?? "?").charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );

  const row = (c: CommentDTO, isReply = false) => {
    const canDelete = me && (me.role === "ADMIN" || me.id === c.author.id);
    return (
      <motion.li
        key={c.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`py-4 ${isReply ? "ml-10 border-l-2 border-line pl-4 sm:ml-12" : "border-b border-line last:border-0"}`}
      >
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {avatar(c)}
            <div className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-bold">
                {c.author.name ?? "Anonymous"}
                {c.author.role === "ADMIN" && (
                  <BadgeCheck className="h-3.5 w-3.5 text-blue-500" strokeWidth={2} aria-label="Verified admin" />
                )}
              </span>
              <time className="block text-[11px] text-ink-faint" dateTime={c.createdAt}>
                {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </time>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {session && !isReply && (
              <button
                onClick={() => startReply(c)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-ink-faint transition-colors hover:text-ink"
                title="Reply"
              >
                <CornerDownRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Reply
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => remove(c.id)}
                disabled={deletingId === c.id}
                className="p-1.5 text-ink-faint transition-colors hover:text-accent disabled:opacity-30"
                title="Delete comment"
                aria-label="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
            )}
          </div>
        </div>
        {c.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={c.imageUrl}
            alt="Comment attachment"
            loading="lazy"
            className="mb-2 max-h-80 w-auto max-w-full border-2 border-ink object-contain"
          />
        )}
        {c.body && <p className="text-[15px] leading-relaxed text-ink-soft">{c.body}</p>}
      </motion.li>
    );
  };

  return (
    <section className="border-t-2 border-ink py-12">
      <div className="mb-8 flex items-center gap-2">
        <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
        <h2 className="label-caps">
          Comments {comments ? `· ${comments.length}` : ""}
        </h2>
      </div>

      {comments === null ? (
        <p className="text-sm text-ink-faint">Loading…</p>
      ) : comments.length === 0 ? (
        <div className="border-2 border-dashed border-line-strong px-6 py-10 text-center">
          <p className="text-sm font-semibold text-ink-faint">No comments yet. Start the conversation.</p>
        </div>
      ) : (
        <ul>
          {roots.map((c) => (
            <div key={c.id}>
              {row(c)}
              <AnimatePresence>
                {repliesOf(c.id).length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    {repliesOf(c.id).map((r) => row(r, true))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}
        </ul>
      )}

      {session ? (
        <div ref={formRef} className="mt-10">
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-3 flex items-center justify-between border-2 border-accent bg-accent/5 px-3 py-2 text-xs font-bold"
              >
                <span className="flex items-center gap-1.5">
                  <CornerDownRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Replying to {replyTo.name}
                </span>
                <button onClick={() => setReplyTo(null)} className="text-ink-faint hover:text-ink" aria-label="Cancel reply">
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={submit}>
            <label htmlFor="comment" className="label-caps mb-2 block">Leave a comment</label>
            {imagePreview && (
              <div className="mb-3 inline-flex items-start gap-3 border-2 border-ink bg-paper-dim p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Attachment preview" className="h-16 w-16 border border-line object-cover" />
                <button
                  type="button"
                  onClick={() => { setPendingImage(null); setImagePreview(null); }}
                  className="text-ink-faint transition-colors hover:text-accent"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            )}
            <textarea
              id="comment"
              rows={3}
              className="input-classic resize-y"
              value={body}
              maxLength={2000}
              onChange={(e) => setBody(e.target.value)}
              placeholder={pendingImage ? "Say something about this image (optional)…" : "Write something thoughtful…"}
            />
            {error && <p className="mt-2 text-sm font-bold text-accent">{error}</p>}
            <div className="mt-3 flex items-center justify-between">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setPendingImage(f);
                  setImagePreview(f ? URL.createObjectURL(f) : null);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage || submitting}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-ink-faint transition-colors hover:text-ink disabled:opacity-40"
                title="Attach an image"
              >
                {uploadingImage ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                )}
                Image
              </button>
              <button
                type="submit"
                disabled={submitting || (!body.trim() && !pendingImage)}
                className="btn-accent disabled:pointer-events-none disabled:opacity-40"
              >
                {submitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <SendHorizonal className="h-4 w-4" strokeWidth={2} aria-hidden />
                )}
                {replyTo ? "Post reply" : "Post comment"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <p className="mt-10 text-sm text-ink-faint">Sign in to join the discussion.</p>
      )}
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </section>
  );
}

