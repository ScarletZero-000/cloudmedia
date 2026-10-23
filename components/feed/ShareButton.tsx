"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

// Web Share API with clipboard fallback — on phones opens the native share
// sheet (perfect for WhatsApp), on desktop copies the link.
export default function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return; // user dismissed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      onClick={share}
      className={`btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs ${className}`}
      title="Share this post"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} aria-hidden />
      ) : (
        <Share2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      )}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
