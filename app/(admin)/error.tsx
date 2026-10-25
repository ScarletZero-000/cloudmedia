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


// Admin console error boundary — same recovery pattern, console-styled copy.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof window !== "undefined") reportError(`admin-boundary: ${error.message}`);

  return (
    <div className="container-classic flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="label-caps text-accent">Console error</p>
      <h1 className="heading-classic mt-3 text-3xl md:text-4xl">The dashboard hit a snag</h1>
      <p className="mt-4 max-w-sm text-sm text-ink-soft">
        If the site was just deployed, reload to grab the fresh build.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={() => window.location.reload()} className="btn-accent">
          Reload page
        </button>
        <button onClick={() => reset()} className="btn-classic">
          Try again
        </button>
      </div>
    </div>
  );
}
