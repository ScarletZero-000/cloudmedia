import Link from "next/link";

// Branded 404 — shown when notFound() is triggered (missing post/profile/album).
export default function NotFound() {
  return (
    <div className="container-classic flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="label-caps text-accent">404</p>
      <h1 className="heading-classic mt-3 text-4xl md:text-5xl">Nothing here</h1>
      <p className="mt-4 max-w-sm text-sm text-ink-soft">
        This page does not exist — it may have been deleted, or the link is wrong.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-accent">
          Back home
        </Link>
        <Link href="/feed" className="btn-classic">
          Browse feed
        </Link>
      </div>
    </div>
  );
}
