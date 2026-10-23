import Link from "next/link";
import { Images, ArrowLeft } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      {/* ink admin bar — matches site chrome */}
      <div className="border-b-2 border-ink bg-ink text-paper">
        <div className="container-classic flex h-14 items-center justify-between">
          <p className="flex items-center gap-2.5 text-sm font-bold">
            <span className="flex h-7 w-7 items-center justify-center bg-accent">
              <Images className="h-3.5 w-3.5 text-paper" strokeWidth={2} aria-hidden />
            </span>
            <span className="font-serif tracking-tightest">CloudMedia</span>
            <span className="border border-paper/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-caps text-paper/70">
              Admin
            </span>
          </p>
          <Link
            href="/feed"
            className="flex items-center gap-1.5 text-sm font-bold text-paper/70 transition-colors hover:text-paper"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            Back to site
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
