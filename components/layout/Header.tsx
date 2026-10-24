"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "@/components/layout/NotificationBell";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Images, LogOut, Menu, UserRound, X, LayoutDashboard, UploadCloud, ChevronDown } from "lucide-react";
import { useRef, useEffect } from "react";

// Smooth navbar:
// - ink bar stays, but links GLIDE (animated underline grows instead of popping)
// - mobile panel slides down with spring physics (AnimatePresence)
// - active state animated via layoutId — the marker physically moves between links
export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isAdmin = session?.user?.role === "ADMIN";

  const links = [
    { href: "/feed", label: "Feed" },
    { href: "/blog", label: "Blog" },
    { href: "/albums", label: "Albums" },
    ...(session ? [{ href: "/upload", label: "Upload" }] : []),
    ...(isAdmin ? [{ href: "/dashboard", label: "Console" }] : []),
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const avatarUrl = session?.user?.image as string | undefined;
  const userName = session?.user?.name as string | undefined;
  const myId = session?.user?.id as string | undefined;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-ink text-paper">
      <div className="container-classic flex h-16 items-center justify-between gap-4">
        {/* brand */}
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center bg-accent transition-transform duration-300 ease-out-expo group-hover:rotate-[-8deg]">
            <Images className="h-4 w-4 text-paper" strokeWidth={2} aria-hidden />
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
              className={`group relative py-1 text-sm font-bold transition-colors duration-200 ${
                isActive(l.href) ? "text-paper" : "text-paper/60 hover:text-paper"
              }`}
            >
              {l.label}
              {/* hover underline: grows from left */}
              <span
                className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-paper/40 transition-transform duration-300 ease-out-expo group-hover:scale-x-100"
                aria-hidden
              />
              {/* active marker: glides between links via layoutId */}
              {isActive(l.href) && (
                <motion.span
                  layoutId="nav-active"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                  className="absolute -bottom-[21px] left-0 h-[3px] w-full bg-accent"
                  aria-hidden
                />
              )}
            </Link>
          ))}
          {session && <NotificationBell />}
          {session ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className="flex items-center gap-2 border-2 border-paper/30 py-1 pl-1 pr-2.5 transition-all duration-200 hover:border-paper"
                aria-label="Account menu"
              >
                <span className="h-7 w-7 overflow-hidden rounded-full border-2 border-paper/40 bg-paper-dim">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-ink">
                      {(userName ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="hidden max-w-[7rem] truncate text-sm font-bold text-paper lg:block">
                  {userName ?? "Account"}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-paper/60 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} strokeWidth={2.5} aria-hidden />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 z-50 mt-2 w-56 border-2 border-ink bg-paper-raised shadow-[6px_6px_0_0_#0c0c0c]"
                    role="menu"
                  >
                    <div className="border-b-2 border-ink px-4 py-3">
                      <p className="truncate text-sm font-bold text-ink">{userName ?? "Account"}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-block border-2 border-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-caps text-accent">Admin</span>
                      )}
                    </div>
                    {myId && (
                      <Link href={`/profile/${myId}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink">
                        <UserRound className="h-4 w-4" strokeWidth={2} aria-hidden />
                        My profile
                      </Link>
                    )}
                    <Link href="/upload" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 border-t border-line px-4 py-3 text-sm font-bold text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink">
                      <UploadCloud className="h-4 w-4" strokeWidth={2} aria-hidden />
                      Upload
                    </Link>
                    {isAdmin && (
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 border-t border-line px-4 py-3 text-sm font-bold text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink">
                        <LayoutDashboard className="h-4 w-4" strokeWidth={2} aria-hidden />
                        Admin console
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="flex w-full items-center gap-2.5 border-t-2 border-ink px-4 py-3 text-left text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 border-2 border-accent bg-accent px-4 py-1.5 text-sm font-bold text-paper transition-all duration-200 hover:-translate-y-px hover:bg-accent-hover hover:border-accent-hover"
            >
              <UserRound className="h-4 w-4" strokeWidth={2} aria-hidden />
              Sign in
            </Link>
          )}
        </nav>

        {/* mobile: hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center border-2 border-paper/30 transition-transform duration-200 active:scale-95 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
        >
          {open ? <X className="h-5 w-5" strokeWidth={2} aria-hidden /> : <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />}
        </button>
      </div>

      {/* mobile panel — slides smoothly */}
      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t-2 border-paper/20 bg-ink md:hidden"
          >
            <div className="container-classic flex flex-col py-3">
              {session && myId && (
                <Link
                  href={`/profile/${myId}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-paper/10 py-3.5 text-sm font-bold text-paper/80"
                >
                  <span className="h-8 w-8 overflow-hidden rounded-full border-2 border-paper/40 bg-paper-dim">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-bold text-ink">
                        {(userName ?? "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  My profile
                </Link>
              )}
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between border-b border-paper/10 py-3.5 text-sm font-bold ${
                      isActive(l.href) ? "text-accent" : "text-paper/80"
                    }`}
                  >
                    {l.label}
                    {isActive(l.href) && <span className="h-2 w-2 bg-accent" aria-hidden />}
                  </Link>
                </motion.div>
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
                  className="mb-2 mt-3 flex items-center justify-center gap-2 border-2 border-accent bg-accent py-3 text-sm font-bold text-paper"
                >
                  <UserRound className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Sign in
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
