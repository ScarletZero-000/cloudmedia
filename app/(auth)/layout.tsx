"use client";

// Auth chrome: same provider so signIn()/useSession work, minimal header.
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { Images } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <header className="border-b-2 border-ink bg-ink text-paper">
          <div className="container-classic flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center bg-accent">
                <Images className="h-4 w-4 text-paper" strokeWidth={2} aria-hidden />
              </span>
              <span className="font-serif text-lg font-bold tracking-tightest">CloudMedia</span>
            </Link>
            <Link href="/feed" className="text-sm font-bold text-paper/70 transition-colors hover:text-paper">
              Browse feed
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t-2 border-ink bg-ink">
          <div className="container-classic flex h-20 items-center">
            <p className="label-caps" style={{ color: "rgba(247,246,242,0.4)" }}>CloudMedia — Est. 2026</p>
          </div>
        </footer>
      </div>
    </SessionProvider>
  );
}
