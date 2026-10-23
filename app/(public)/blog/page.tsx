import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

// Blog index: editorial layout — every entry shows its own thumbnail,
// title, first paragraph, author + date. Clean Classic, list style.
export const metadata: Metadata = {
  title: "Blog — CloudMedia",
  description: "Stories, notes, and photo essays from the community.",
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, role: true } },
      album: { select: { title: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="container-classic py-12 md:py-16">
      <header className="mb-12 max-w-2xl">
        <p className="label-caps mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Journal
        </p>
        <h1 className="heading-classic text-4xl md:text-5xl">Blog</h1>
        <p className="mt-4 text-ink-soft">
          Stories, notes, and photo essays — every entry with its own cover.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-ink-faint">Nothing published yet.</p>
      ) : (
        <div className="flex flex-col">
          {posts.map((post, i) => {
            const blocks = post.description as { type: string; text?: string }[] | null;
            const excerpt =
              blocks?.find((b) => b.type === "paragraph")?.text?.slice(0, 180) ??
              "View this entry for the full story and comments.";
            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className={`group grid grid-cols-[auto,1fr] items-center gap-6 py-8 transition-colors md:grid-cols-[8rem,1fr,12rem] md:gap-10 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                {/* numbered index — editorial flavor on desktop */}
                <span className="hidden font-serif text-2xl text-ink-faint md:block">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <p className="label-caps mb-2">
                    {post.album?.title ?? post.type.toLowerCase()} · {post._count.comments} comments
                  </p>
                  <h2 className="heading-classic text-2xl transition-colors group-hover:text-accent md:text-3xl">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{excerpt}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
                    {post.author.name ?? "Anonymous"}
                    {post.author.role === "ADMIN" && (
                      // verified tick inline (svg via lucide in server component)
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-blue-500" aria-label="Verified admin">
                        <path d="M12 2l2.4 2.4 3.4-.5.5 3.4L20.8 9.7l-1.2 3.3 1.2 3.3-2.5 2.4-.5 3.4-3.4-.5L12 24l-2.4-2.4-3.4.5-.5-3.4L3.2 16.3l1.2-3.3-1.2-3.3 2.5-2.4.5-3.4 3.4.5L12 2zm-1.2 13.6l5.3-5.3-1.4-1.4-3.9 3.9-1.9-1.9-1.4 1.4 3.3 3.3z" />
                      </svg>
                    )}
                    <span aria-hidden>·</span>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* per-post thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.thumbnailUrl || post.url}
                  alt={post.title}
                  loading="lazy"
                  className="hidden aspect-[4/3] w-full border border-line object-cover transition-transform duration-300 ease-out-expo group-hover:scale-[1.02] md:block"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
