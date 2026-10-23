export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper-dim">
      <div className="border-b border-line bg-paper">
        <div className="container-classic flex h-16 items-center justify-between">
          <p className="label-caps">CloudMedia — Administration</p>
          <a href="/feed" className="text-sm text-ink-soft transition-colors hover:text-ink">
            Back to site
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}
