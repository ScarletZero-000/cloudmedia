import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

// Blog = magazine. Only posts flagged isBlog (admin-published articles).
// Layout: latest entry is a full-width hero, the rest are a numbered editorial list.
export const metadata: Metadata = {
  title: "Blog — CloudMedia",
  description: "Stories, notes, and photo essays from the community.",
};

function excerptOf(description: unknown): string {
  const blocks = description as { type: string; text?: string }[] | null;
  return (
    blocks?.find((b) => b.type === "paragraph")?.text?.slice(0, 220) ??
    "Read this entry for the full story."
  );
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true, status: "APPROVED", isBlog: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, role: true } },
      album: { select: { title: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  const [hero, ...rest] = posts;

  return (
    <div className="container-classic py-12 md:py-16">
      <header className="mb-14 max-w-2xl">
        <p className="label-caps mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Journal
        </p>
        <h1 className="heading-classic text-4xl md:text-5xl">Blog</h1>
        <p className="mt-4 text-ink-soft">
          Long-form stories and photo essays — separate from the main feed.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="card-hard p-10 text-center">
          <p className="heading-classic text-2xl">Nothing published yet</p>
          <p className="mt-2 text-sm text-ink-soft">
            Blog entries are published by the team. Check back soon.
          </p>
        </div>
      ) : (
        <>
          {/* HERO — latest entry, full bleed */}
          {hero && (
            <Link
              href={`/post/${(hero as any).slug || hero.id}`}
              className="group card-hard mb-16 grid md:grid-cols-2"
            >
              <div className="overflow-hidden border-b-2 border-ink md:border-b-0 md:border-r-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.thumbnailUrl || hero.url}
                  alt={hero.title}
                  className="h-64 w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03] md:h-full md:min-h-[24rem]"
                />
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
                <p className="label-caps text-accent">Latest entry</p>
                <h2 className="heading-classic text-3xl transition-colors group-hover:text-accent md:text-4xl">
                  {hero.title}
                </h2>
                <p className="prose-classic line-clamp-3 text-sm">{excerptOf(hero.description)}</p>
                <p className="flex items-center gap-1.5 text-xs text-ink-faint">
                  {hero.author.name ?? "Anonymous"}
                  <span aria-hidden>·</span>
                  {new Date(hero.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <span aria-hidden>·</span>
                  {hero._count.likes} likes · {hero._count.comments} comments
                </p>
              </div>
            </Link>
          )}

          {/* ARCHIVE — numbered list */}
          {rest.length > 0 && (
            <section>
              <h2 className="label-caps mb-6">Archive</h2>
              <div className="flex flex-col">
                {rest.map((post, i) => {
                  return (
                    <Link
                      key={post.id}
                      href={`/post/${(post as any).slug || post.id}`}
                      className={`group grid grid-cols-[auto,1fr] items-center gap-6 py-7 transition-colors md:grid-cols-[4rem,1fr,10rem] md:gap-10 ${
                        i > 0 ? "border-t border-line" : ""
                      }`}
                    >
                      <span className="hidden font-serif text-2xl text-ink-faint md:block">
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="heading-classic text-2xl transition-colors group-hover:text-accent">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                          {excerptOf(post.description)}
                        </p>
                        <p className="mt-3 text-xs text-ink-faint">
                          {post.author.name ?? "Anonymous"}
                          <span aria-hidden> · </span>
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
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
            </section>
          )}
        </>
      )}
    </div>
  );
}
