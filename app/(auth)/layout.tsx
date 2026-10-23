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
        <header className="border-b border-line">
          <div className="container-classic flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Images className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              <span className="font-serif text-lg tracking-tightest">CloudMedia</span>
            </Link>
            <Link href="/feed" className="text-sm text-ink-soft hover:text-ink transition-colors">
              Browse feed
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line">
          <div className="container-classic flex h-20 items-center">
            <p className="label-caps">CloudMedia — Est. 2026</p>
          </div>
        </footer>
      </div>
    </SessionProvider>
  );
}
