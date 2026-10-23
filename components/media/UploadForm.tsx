"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { UploadCloud, ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";

export default function UploadForm({ albums }: { albums: { id: string; title: string }[] }) {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!session) {
    return <p className="text-ink-faint">Sign in to upload media.</p>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("uploading");
    setMessage("");

    const fd = new FormData();
    fd.append("file", file);
    if (title) fd.append("title", title);
    if (desc.trim()) fd.append("description", JSON.stringify([{ type: "paragraph", text: desc.trim() }]));
    if (albumId) fd.append("albumId", albumId);
    if (tags.trim()) fd.append("tags", tags);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setStatus("done");
      setMessage(data.post.url);
      setFile(null);
      setTitle("");
      setDesc("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={onSubmit}
      className="card-hard max-w-xl space-y-8 p-6 sm:p-8"
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) setFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-ink-soft bg-paper-dim px-8 py-16 text-center transition-all hover:border-accent hover:bg-accent/5 ${
          dragOver ? "border-ink bg-paper-dim" : "border-line-strong hover:border-ink"
        }`}
      >
        {file ? (
          <ImageIcon className="h-8 w-8 text-ink" strokeWidth={1.5} aria-hidden />
        ) : (
          <UploadCloud className="h-8 w-8 text-ink-faint" strokeWidth={1.5} aria-hidden />
        )}
        <div>
          <p className="text-sm font-medium">{file ? file.name : "Drop a file or click to browse"}</p>
          <p className="mt-1 text-xs text-ink-faint">JPEG, PNG, WebP, GIF, AVIF — up to 10 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="label-caps mb-2 block">Title</label>
          <input
            id="title"
            className="input-classic"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
          />
        </div>
        <div>
          <label htmlFor="desc" className="label-caps mb-2 block">Description (optional)</label>
          <textarea
            id="desc"
            rows={3}
            className="input-classic resize-y"
            value={desc}
            maxLength={500}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Short description — shown under the title and used as the WhatsApp link preview text."
          />
          <p className="mt-1.5 text-[11px] text-ink-faint">{desc.length}/500</p>
        </div>
        <div>
          <label htmlFor="tags" className="label-caps mb-2 block">Tags (optional)</label>
          <input
            id="tags"
            className="input-classic"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="anime, wallpaper, scenery — comma separated"
          />
          <p className="mt-1.5 text-[11px] text-ink-faint">Up to 5 tags, lowercase. Searchable in the feed.</p>
        </div>
        {albums.length > 0 && (
          <div>
            <label htmlFor="album" className="label-caps mb-2 block">Album (optional)</label>
            <select id="album" className="input-classic" value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
              <option value="">— None —</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={!file || status === "uploading"} className="btn-classic disabled:opacity-40 disabled:pointer-events-none">
          <UploadCloud className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
        {status === "done" && (
          <span className="flex items-center gap-1.5 text-sm text-ink-soft">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Uploaded
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-1.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" aria-hidden /> {message}
          </span>
        )}
      </div>
    </motion.form>
  );
}
