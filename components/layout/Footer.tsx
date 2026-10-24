import Link from "next/link";
import { Images } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Footer is a server component: account column adapts to session.
// Logged in -> My profile / Browse feed / console. Guest -> Sign in / Create account.
export default async function Footer() {
  const session = await getServerSession(authOptions);
  const myId = session?.user?.id as string | undefined;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="container-classic grid gap-10 py-14 md:grid-cols-[1fr_auto_auto]">
        {/* brand block */}
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center bg-accent">
              <Images className="h-4 w-4 text-paper" strokeWidth={2} aria-hidden />
            </span>
            <span className="font-serif text-lg font-bold tracking-tightest">CloudMedia</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-paper/50">
            A media platform for images, video, and stories. Built with restraint.
          </p>
        </div>

        {/* sitemap */}
        <nav className="flex flex-col gap-2.5 text-sm font-semibold">
          <p className="label-caps mb-1" style={{ color: "rgba(247,246,242,0.4)" }}>Explore</p>
          <Link href="/feed" className="text-paper/70 transition-colors hover:text-accent">Feed</Link>
          <Link href="/blog" className="text-paper/70 transition-colors hover:text-accent">Blog</Link>
          <Link href="/albums" className="text-paper/70 transition-colors hover:text-accent">Albums</Link>
          <Link href="/upload" className="text-paper/70 transition-colors hover:text-accent">Upload</Link>
        </nav>

        {/* account — adapts to login state */}
        <nav className="flex flex-col gap-2.5 text-sm font-semibold">
          <p className="label-caps mb-1" style={{ color: "rgba(247,246,242,0.4)" }}>Account</p>
          {session ? (
            <>
              {myId && (
                <Link href={`/profile/${myId}`} className="text-paper/70 transition-colors hover:text-accent">
                  My profile
                </Link>
              )}
              <Link href="/feed" className="text-paper/70 transition-colors hover:text-accent">Browse feed</Link>
              {isAdmin && (
                <Link href="/dashboard" className="text-paper/70 transition-colors hover:text-accent">Admin console</Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="text-paper/70 transition-colors hover:text-accent">Sign in</Link>
              <Link href="/register" className="text-paper/70 transition-colors hover:text-accent">Create account</Link>
            </>
          )}
        </nav>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-classic flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-caps" style={{ color: "rgba(247,246,242,0.4)" }}>Scarlet × CloudMedia — 2026</p>
          <p className="text-xs text-paper/40">All images belong to their authors.</p>
        </div>
      </div>
    </footer>
  );
}
