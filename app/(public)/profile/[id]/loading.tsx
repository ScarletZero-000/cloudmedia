// Profile loading skeleton
export default function ProfileLoading() {
  return (
    <div className="container-classic py-12 md:py-16" aria-busy="true">
      <div className="card-hard mb-10 animate-pulse p-6 md:p-10">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-paper-dim md:h-32 md:w-32" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-40 bg-paper-dim" />
            <div className="h-3 w-32 bg-paper-dim" />
            <div className="h-3 w-48 bg-paper-dim" />
          </div>
        </div>
      </div>
      <div className="mb-16 h-16 animate-pulse border-2 border-ink-soft bg-paper-dim" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
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
