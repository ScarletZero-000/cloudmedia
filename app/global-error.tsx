"use client";

// Global error boundary: when a client-side exception occurs (most commonly
// stale cached JS chunks right after a deploy), show a branded recovery screen
// with a reload button instead of the raw white "Application error" page.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#F7F6F2", color: "#0C0C0C", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: "32rem", margin: "18vh auto 0", padding: "0 1.5rem", textAlign: "center" }}>
          <div style={{ border: "2px solid #0C0C0C", boxShadow: "6px 6px 0 0 #0C0C0C", padding: "2.5rem 2rem", background: "#fff" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#B3401E", marginBottom: "0.75rem" }}>
              Something broke
            </p>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
              The page hit an error
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#57534E", lineHeight: 1.6, marginBottom: "1.75rem" }}>
              This usually happens when the site was just updated and your browser
              still holds an old cached copy. Reloading almost always fixes it.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => window.location.reload()}
                style={{ border: "2px solid #0C0C0C", background: "#B3401E", color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.6rem 1.25rem", cursor: "pointer", boxShadow: "4px 4px 0 0 #0C0C0C" }}
              >
                Reload page
              </button>
              <button
                onClick={() => { try { reset(); } catch { window.location.reload(); } }}
                style={{ border: "2px solid #0C0C0C", background: "#fff", color: "#0C0C0C", fontWeight: 700, fontSize: "0.875rem", padding: "0.6rem 1.25rem", cursor: "pointer" }}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
