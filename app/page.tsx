import Link from "next/link";
import { ArrowRight, Images, UploadCloud, MessageCircle, Flame, Heart } from "lucide-react";
import HeroVideo from "@/components/layout/HeroVideo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function trendingPosts() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const posts = await prisma.post.findMany({
    where: { published: true, status: "APPROVED", createdAt: { gte: since } },
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return posts.sort((a, b) => b._count.likes - a._count.likes).slice(0, 3);
}

export default async function LandingPage() {
  const trending = await trendingPosts();
  return (
    <div className="container-classic">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <HeroVideo />
        <p className="label-caps mb-6">A media platform, done properly</p>
        <h1 className="heading-classic max-w-3xl text-5xl md:text-7xl">
          Where images live, and conversations begin.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
          CloudMedia is a place to publish photographs, group them into albums,
          and write about them with structure — then let the community respond.
          No noise. No clutter. Just the work.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/feed" className="btn-classic">
            Browse the feed
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
          <Link href="/upload" className="btn-ghost">
            <UploadCloud className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Upload an image
          </Link>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-line py-20">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Images className="mb-5 h-6 w-6" strokeWidth={1.5} aria-hidden />
            <h2 className="heading-classic mb-3 text-2xl">Media engine</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Images upload straight to blob storage and return permanent URLs.
              Group them into albums, add dimensions and titles automatically.
            </p>
          </div>
          <div>
            <MessageCircle className="mb-5 h-6 w-6" strokeWidth={1.5} aria-hidden />
            <h2 className="heading-classic mb-3 text-2xl">Real discussion</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              A commenting system tied to the database — visible to every
              visitor, backed by real accounts, no drive-by spam.
            </p>
          </div>
          <div>
            <span className="label-caps mb-5 block text-[13px] tracking-caps">01 — 03</span>
            <h2 className="heading-classic mb-3 text-2xl">Writing that scales</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Descriptions support Notion-like blocks: paragraphs, headings,
              quotes, lists, bold and links. Structure for the words that
              deserve it.
            </p>
          </div>
        </div>
      </section>

      {/* Trending this week */}
      {trending.length > 0 && (
        <section className="border-t-2 border-ink py-20">
          <div className="mb-10 flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden />
            <p className="label-caps">Trending this week</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {trending.map((post, i) => (
              <Link
                key={post.id}
                href={`/post/${post.slug || post.id}`}
                className="card-hard group block"
              >
                <div className="relative overflow-hidden border-b-2 border-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.url}
                    alt={post.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 border-2 border-ink bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-paper">
                    #{i + 1}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="heading-classic text-lg">{post.title}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-faint">
                    <Heart className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} aria-hidden />
                    {post._count.likes} likes · {post.author.name ?? "Anonymous"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-line py-24 text-center">
        <p className="label-caps mb-6">Ready when you are</p>
        <h2 className="heading-classic mx-auto max-w-2xl text-4xl md:text-5xl">
          Start with a single image.
        </h2>
        <div className="mt-10 flex justify-center">
          <Link href="/register" className="btn-classic">
            Create an account
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
