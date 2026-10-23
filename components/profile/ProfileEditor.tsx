"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, Pencil, LoaderCircle } from "lucide-react";

// Inline profile editor. Server-side the PATCH route is owner-only (session id);
// here we hide the button unless the viewer owns this profile.
export default function ProfileEditor({
  userId,
  initialName,
  initialImage,
}: {
  userId: string;
  initialName: string | null;
  initialImage: string | null;
}) {
  const { data: session } = useSession();
  const isOwner = session?.user?.id === userId;
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOwner) return null;

  async function onSave() {
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("name", name);
      if (file) fd.set("avatar", file);
      const res = await fetch("/api/profile", { method: "PATCH", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed");
      }
      setEditing(false);
      setPreview(null);
      setFile(null);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full space-y-4 sm:w-72"
          >
            <div>
              <label htmlFor="pf-name" className="label-caps mb-2 block">Display name</label>
              <input
                id="pf-name"
                className="input-classic"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <p className="label-caps mb-2">Avatar</p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-ink bg-paper-dim">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  ) : initialImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={initialImage} alt="Current" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="btn-ghost px-3 py-2 text-xs"
                >
                  <Camera className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Choose photo
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    setPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-ink-faint">JPEG/PNG/WebP, max 5MB.</p>
            </div>
            {error && <p className="text-xs font-bold text-accent">{error}</p>}
            <div className="flex gap-2">
              <button onClick={onSave} disabled={saving} className="btn-accent flex-1 justify-center py-2.5 text-xs disabled:opacity-40">
                {saving ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setPreview(null); setFile(null); setName(initialName ?? ""); }}
                className="btn-ghost py-2.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setEditing(true)}
            className="btn-classic w-full justify-center sm:w-auto"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
            Edit profile
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
