// Post page loading skeleton
export default function PostLoading() {
  return (
    <div className="container-classic max-w-3xl py-12 md:py-16" aria-busy="true">
      <div className="card-hard animate-pulse">
        <div className="aspect-[4/3] w-full border-b-2 border-ink bg-paper-dim" />
        <div className="space-y-4 p-6 md:p-10">
          <div className="h-8 w-3/4 bg-paper-dim" />
          <div className="h-3 w-1/3 bg-paper-dim" />
          <div className="h-3 w-2/3 bg-paper-dim" />
        </div>
      </div>
      <div className="mt-10 space-y-4">
        <div className="h-3 w-32 animate-pulse bg-paper-dim" />
        <div className="h-24 w-full animate-pulse border-2 border-ink-soft bg-paper-dim" />
      </div>
    </div>
  );
}
