"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

// Download the original image + copy the post URL. Small ghost-style pair.
export default function PostActions({
  url,
  title,
  className = "",
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked (e.g. http) — fallback: select nothing, fail quietly
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={`/api/download?url=${encodeURIComponent(url)}`}
        download
        className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
        title="Download the original image"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Download
      </a>
      <button
        onClick={copyLink}
        className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
        title="Copy post link"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
