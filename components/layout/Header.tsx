"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Images, LayoutDashboard, LogOut, Menu, Upload, UserRound, X } from "lucide-react";

// Bold editorial navbar:
// - solid ink bar (not washed-out paper) — strong brand presence
// - active route gets an accent marker
// - on mobile: links collapse into a full-width panel (no cramped overflow)
export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  const links = [
    { href: "/feed", label: "Feed" },
    { href: "/blog", label: "Blog" },
    ...(session ? [{ href: "/upload", label: "Upload" }] : []),
    ...(isAdmin ? [{ href: "/dashboard", label: "Console" }] : []),
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-ink text-paper">
      <div className="container-classic flex h-16 items-center justify-between gap-4">
        {/* brand */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center bg-accent">
            <Images className="h-4.5 w-4.5 text-paper" strokeWidth={2} aria-hidden />
          </span>
          <span className="font-serif text-lg font-bold tracking-tightest">
            CloudMedia
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative py-1 text-sm font-bold transition-colors ${
                isActive(l.href) ? "text-paper" : "text-paper/60 hover:text-paper"
              }`}
            >
              {l.label}
              {/* active marker: accent bar under the word */}
              <span
                className={`absolute -bottom-[21px] left-0 h-[3px] w-full bg-accent transition-opacity ${
                  isActive(l.href) ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden
              />
            </Link>
          ))}
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 border-2 border-paper/30 px-3.5 py-1.5 text-sm font-bold text-paper/80 transition-colors hover:border-paper hover:text-paper"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 border-2 border-accent bg-accent px-4 py-1.5 text-sm font-bold text-paper transition-colors hover:bg-accent-hover hover:border-accent-hover"
            >
              <UserRound className="h-4 w-4" strokeWidth={2} aria-hidden />
              Sign in
            </Link>
          )}
        </nav>

        {/* mobile: hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center border-2 border-paper/30 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
        >
          {open ? <X className="h-5 w-5" strokeWidth={2} aria-hidden /> : <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />}
        </button>
      </div>

      {/* mobile panel */}
      {open && (
        <nav className="border-t-2 border-paper/20 bg-ink md:hidden">
          <div className="container-classic flex flex-col py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between border-b border-paper/10 py-3.5 text-sm font-bold ${
                  isActive(l.href) ? "text-accent" : "text-paper/80"
                }`}
              >
                {l.label}
                {isActive(l.href) && <span className="h-2 w-2 bg-accent" aria-hidden />}
              </Link>
            ))}
            {session ? (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-2 py-3.5 text-sm font-bold text-paper/60"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-3 mb-2 flex items-center justify-center gap-2 border-2 border-accent bg-accent py-3 text-sm font-bold text-paper"
              >
                <UserRound className="h-4 w-4" strokeWidth={2} aria-hidden />
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
