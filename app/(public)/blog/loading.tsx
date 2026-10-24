// Blog loading skeleton (hero + list rows)
export default function BlogLoading() {
  return (
    <div className="container-classic py-12 md:py-16" aria-busy="true">
      <div className="mb-14 max-w-2xl">
        <div className="mb-4 h-3 w-20 animate-pulse bg-paper-dim" />
        <div className="h-10 w-48 animate-pulse bg-paper-dim" />
      </div>
      <div className="card-hard mb-16 grid animate-pulse md:grid-cols-2">
        <div className="h-64 border-b-2 border-ink bg-paper-dim md:h-full md:min-h-[24rem] md:border-b-0 md:border-r-2" />
        <div className="space-y-4 p-8">
          <div className="h-3 w-24 bg-paper-dim" />
          <div className="h-8 w-3/4 bg-paper-dim" />
          <div className="h-3 w-full bg-paper-dim" />
          <div className="h-3 w-2/3 bg-paper-dim" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex animate-pulse items-center gap-6 border-t border-line py-6">
            <div className="h-4 w-full max-w-md bg-paper-dim" />
            <div className="ml-auto hidden h-20 w-28 bg-paper-dim md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
