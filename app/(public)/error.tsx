"use client";
function reportError(message: string) {
  try {
    fetch("/api/client-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, url: window.location.href }),
    }).catch(() => {});
  } catch {}
}


// Route-level client error boundary (public group). Shows branded recovery card,
// keeps header/footer intact (unlike global-error which replaces everything).
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof window !== "undefined") reportError(`public-boundary: ${error.message}`);

  return (
    <div className="container-classic flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="label-caps text-accent">Error</p>
      <h1 className="heading-classic mt-3 text-3xl md:text-4xl">This section hit a snag</h1>
      <p className="mt-4 max-w-sm text-sm text-ink-soft">
        Something failed while rendering. A retry usually fixes it — if the site was
        just updated, a full reload will fetch the fresh version.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="btn-accent"
        >
          Reload page
        </button>
        <button onClick={() => reset()} className="btn-classic">
          Try again
        </button>
      </div>
    </div>
  );
}
