"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Images, LogOut, Menu, UserRound, X } from "lucide-react";

// Smooth navbar:
// - ink bar stays, but links GLIDE (animated underline grows instead of popping)
// - mobile panel slides down with spring physics (AnimatePresence)
// - active state animated via layoutId — the marker physically moves between links
export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 border-2 border-paper/30 px-3.5 py-1.5 text-sm font-bold text-paper/80 transition-all duration-200 hover:-translate-y-px hover:border-paper hover:text-paper"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
              Sign out
            </button>
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
