"use client";

import { useEffect } from "react";

// Auto-recover from stale-chunk crashes: after each deploy, chunk hashes change.
// Browsers holding an old HTML shell reference dead chunks -> ChunkLoadError -> white page.
// This listener reloads once (session-flagged) to fetch the fresh shell. Never loops.
export default function ChunkGuard() {
  useEffect(() => {
    const KEY = "cm_chunk_reload";
    const onError = (e: ErrorEvent) => {
      const msg = e.message || "";
      const isChunk = /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed/i.test(msg);
      if (isChunk && !sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
      }
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);
  return null;
}
