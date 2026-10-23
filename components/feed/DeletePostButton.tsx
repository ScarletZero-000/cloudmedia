"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog, { type ConfirmState } from "@/components/ui/ConfirmDialog";
import { Trash2, LoaderCircle } from "lucide-react";

// Small trash button that deletes a post via DELETE /api/posts/[id].
// Shown to the post's owner or an admin (server enforces the same rule).
export default function DeletePostButton({
  postId,
  title,
  className = "",
}: {
  postId: string;
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [deleting, setDeleting] = useState(false);

  async function doDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch {
      // surface nothing fancy — refresh still reflects the truth if it worked
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() =>
          setConfirmState({
            title: "Delete this post?",
            body: "The image is removed from the feed permanently, along with its comments.",
            confirmLabel: "Delete", danger: true,
            onConfirm: doDelete,
          })
        }
        disabled={deleting}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-ink-faint transition-colors hover:text-accent disabled:opacity-40 ${className}`}
        title="Delete post"
        aria-label={`Delete post${title ? `: ${title}` : ""}`}
      >
        {deleting ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} aria-hidden />
        ) : (
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        )}
        Delete
      </button>

      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </>
  );
}
