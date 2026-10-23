"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, LoaderCircle, Check, X, ImagePlus } from "lucide-react";
import ConfirmDialog, { type ConfirmState } from "@/components/ui/ConfirmDialog";

type PostLite = {
  id: string;
  title: string;
  description: { type: string; text: string }[] | null;
  url: string;
  canEdit: boolean;
};

// Inline editor on the post page. Shows an Edit button for owner/admin;
// title, description and image replacement all go through PATCH /api/posts/[id].
export default function EditPostButton({ post }: { post: PostLite }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [desc, setDesc] = useState(post.description?.[0]?.text ?? "");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!post.canEdit) return null;

  function pickFile(f: File | null) {
    setNewFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function save() {
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let imageUrl: string | undefined;
      if (newFile) {
        // image swap goes through the upload endpoint first (Blob storage)
        const fd = new FormData();
        fd.append("file", newFile);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("Image upload failed.");
        const { url } = await up.json();
        imageUrl = url;
      }

      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: [{ type: "paragraph", text: desc.trim() }],
          ...(imageUrl && { url: imageUrl }),
        }),
      });
      if (!res.ok) throw new Error("Could not save changes.");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Edit post
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/70 p-4"
            onClick={() => !saving && setOpen(false)}
            role="presentation"
          >
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[90dvh] w-full max-w-lg overflow-y-auto border-2 border-ink bg-paper-raised shadow-[6px_6px_0_0_#0c0c0c]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
                <h2 className="heading-classic text-xl">Edit post</h2>
                <button
                  onClick={() => !saving && setOpen(false)}
                  className="text-ink-faint transition-colors hover:text-ink"
                  aria-label="Close editor"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </button>
              </div>

              <div className="space-y-5 p-5">
                {/* title */}
                <div>
                  <label htmlFor="edit-title" className="label-caps mb-2 block">Title</label>
                  <input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-classic w-full"
                    maxLength={200}
                  />
                </div>

                {/* description */}
                <div>
                  <label htmlFor="edit-desc" className="label-caps mb-2 block">
                    Description
                    <span className="ml-2 font-mono text-[10px] text-ink-faint">{desc.length}/500</span>
                  </label>
                  <textarea
                    id="edit-desc"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value.slice(0, 500))}
                    rows={4}
                    className="input-classic w-full resize-none"
                    placeholder="Shown on the post page and in WhatsApp link previews."
                  />
                </div>

                {/* image swap */}
                <div>
                  <span className="label-caps mb-2 block">Image</span>
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview ?? post.url}
                      alt="Current image"
                      className="h-20 w-20 shrink-0 border-2 border-ink object-cover"
                    />
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                      >
                        <ImagePlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        {newFile ? "Change again" : "Replace image"}
                      </button>
                      {newFile && (
                        <button
                          type="button"
                          onClick={() => pickFile(null)}
                          className="block text-xs text-ink-faint underline hover:text-ink"
                        >
                          Keep current image
                        </button>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        className="hidden"
                        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                      />
                      <p className="max-w-[16rem] text-[11px] text-ink-faint">
                        {newFile ? newFile.name : "JPEG, PNG, WebP, GIF or AVIF — max 10 MB."}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="border-2 border-accent bg-accent/5 px-3 py-2 text-xs font-bold text-accent">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-line pt-4">
                  <button
                    onClick={() => !saving && setOpen(false)}
                    disabled={saving}
                    className="btn-ghost px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      newFile
                        ? setConfirmState({
                            title: "Replace the image?",
                            body: "The old image file is removed from storage and the link preview updates on the next share.",
                            confirmLabel: "Save changes", danger: false,
                            onConfirm: save,
                          })
                        : save()
                    }
                    disabled={saving}
                    className="btn-classic inline-flex items-center gap-2 px-5 py-2 text-xs"
                  >
                    {saving ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} aria-hidden />
                    ) : (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    )}
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </>
  );
}
