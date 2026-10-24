// Skeleton grid shown while the feed mounts — never a blank page.
export default function FeedSkeleton() {
  return (
    <div className="container-classic py-12 md:py-16" aria-busy="true" aria-label="Loading feed">
      <div className="mb-10 h-10 w-64 animate-pulse border-2 border-ink-soft bg-paper-dim" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-line animate-pulse">
            <div className="aspect-[4/3] w-full border-b-2 border-ink-soft bg-paper-dim" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 bg-paper-dim" />
              <div className="h-3 w-1/2 bg-paper-dim" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
