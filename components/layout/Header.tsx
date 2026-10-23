"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Images, LayoutDashboard, LogOut, Upload, UserRound } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-none">
      <div className="container-classic flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Images className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          <span className="font-serif text-lg tracking-tightest">CloudMedia</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/feed" className="text-sm text-ink-soft hover:text-ink transition-colors">
            Feed
          </Link>
          {session ? (
            <>
              <Link href="/upload" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors">
                <Upload className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Upload
              </Link>
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors">
                  <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  Console
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-classic">
              <UserRound className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
