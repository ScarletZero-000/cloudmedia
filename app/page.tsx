import Link from "next/link";
import {
  ArrowRight,
  Images,
  UploadCloud,
  MessageCircle,
  Flame,
  Heart,
  Eye,
  Sparkles,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function landingData() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [trendingRaw, totals, recent] = await Promise.all([
    prisma.post.findMany({
      where: { published: true, status: "APPROVED", createdAt: { gte: since } },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    Promise.all([
      prisma.post.count({ where: { published: true, status: "APPROVED" } }),
      prisma.user.count(),
      prisma.comment.count(),
    ]),
    prisma.post.findMany({
      where: { published: true, status: "APPROVED" },
      include: { author: { select: { id: true, name: true, image: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  const trending = trendingRaw
    .sort((a, b) => b._count.likes - a._count.likes)
    .slice(0, 3);
  return { trending, counts: totals, recent };
}

export default async function LandingPage() {
  const { trending, counts, recent } = await landingData();
  const [posts, users, comments] = counts;

  return (
    <div className="container-classic">
      {/* HERO — split layout: copy left, latest-uploads strip right */}
      <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="label-caps mb-5 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} aria-hidden />
            A media platform, done properly
          </p>
          <h1 className="heading-classic text-5xl md:text-7xl">
            Where images live, <em>and conversations begin.</em>
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
            Publish photographs, group them into albums, and write about them
            with structure — then let the community respond. No noise. Just the work.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/feed" className="btn-accent">
              Browse the feed
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </Link>
            <Link href="/upload" className="btn-classic">
              <UploadCloud className="h-4 w-4" strokeWidth={2} aria-hidden />
              Upload an image
            </Link>
            <Link href="/register" className="text-sm font-bold underline decoration-2 underline-offset-4 transition-colors hover:text-accent">
              Create a free account
            </Link>
          </div>

          {/* live numbers — small but real */}
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-px border-2 border-ink bg-ink">
            {[
              { label: "Images", value: posts, icon: Images },
              { label: "Members", value: users, icon: ShieldCheck },
              { label: "Comments", value: comments, icon: MessageCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-paper-raised p-4 text-center">
                <Icon className="mx-auto mb-2 h-4 w-4 text-accent" strokeWidth={2} aria-hidden />
                <dd className="heading-classic text-2xl">{value}</dd>
                <dt className="label-caps mt-1 text-[9px]">{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* latest uploads — live from the DB */}
        <div className="space-y-4">
          <p className="label-caps flex items-center gap-2">
            <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Fresh from the community
          </p>
          {recent.length === 0 ? (
            <div className="card-hard p-8 text-center text-sm text-ink-faint">
              No uploads yet — yours could be the first.
            </div>
          ) : (
            recent.slice(0, 4).map((post, i) => (
              <Link
                key={post.id}
                href={`/post/${post.slug || post.id}`}
                className={`card-line group flex items-center gap-4 p-3 ${i === 0 ? "card-hard" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.url}
                  alt={post.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-16 w-16 shrink-0 border-2 border-ink object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="heading-classic truncate text-base">{post.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-faint">
                    {post.author.name ?? "Anonymous"}
                    {post.author.role === "ADMIN" && (
                      <ShieldCheck className="h-3 w-3 text-accent" strokeWidth={2.5} aria-label="Admin" />
                    )}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-accent" strokeWidth={2} aria-hidden />
              </Link>
            ))
          )}
          <Link href="/feed" className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-ink-soft transition-colors hover:text-accent">
            See everything
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </section>

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="border-t-2 border-ink py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="label-caps mb-2 flex items-center gap-2">
                <Flame className="h-4 w-4 text-accent" strokeWidth={2} aria-hidden />
                Trending this week
              </p>
              <h2 className="heading-classic text-3xl md:text-4xl">The community&apos;s picks.</h2>
            </div>
            <Link href="/feed" className="hidden items-center gap-1.5 text-sm font-bold transition-colors hover:text-accent sm:flex">
              View feed <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {trending.map((post, i) => (
              <Link key={post.id} href={`/post/${post.slug || post.id}`} className="card-hard group block">
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

      {/* WHAT YOU CAN DO — concrete capabilities, not abstract principles */}
      <section className="border-t border-line py-20">
        <p className="label-caps mb-2">Built for sharing</p>
        <h2 className="heading-classic mb-12 max-w-xl text-3xl md:text-4xl">
          Everything a media community needs — nothing it doesn&apos;t.
        </h2>
        <div className="grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
          <div className="bg-paper-raised p-8">
            <Images className="mb-5 h-6 w-6 text-accent" strokeWidth={1.75} aria-hidden />
            <h3 className="heading-classic mb-3 text-xl">Upload &amp; organize</h3>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Drop an image, title it, describe it — it&apos;s live with its own
              readable link in seconds. Group related shots into albums and
              manage them any time.
            </p>
          </div>
          <div className="bg-paper-raised p-8">
            <MessageCircle className="mb-5 h-6 w-6 text-accent" strokeWidth={1.75} aria-hidden />
            <h3 className="heading-classic mb-3 text-xl">Talk about it</h3>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Threaded replies, image attachments in comments, likes that
              actually mean something. Every conversation is tied to a real
              account — no drive-by spam.
            </p>
          </div>
          <div className="bg-paper-raised p-8">
            <FolderOpen className="mb-5 h-6 w-6 text-accent" strokeWidth={1.75} aria-hidden />
            <h3 className="heading-classic mb-3 text-xl">Own your page</h3>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              A profile with your avatar, uploads and comment history. Edit or
              delete your posts whenever you want — your work stays yours.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA — a real panel, not a lonely button */}
      <section className="border-t-2 border-ink py-20">
        <div className="card-hard mx-auto max-w-3xl overflow-hidden">
          <div className="border-b-2 border-ink bg-accent px-8 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-paper">Join the community</p>
          </div>
          <div className="grid items-center gap-8 p-8 md:grid-cols-[1fr_auto] md:p-10">
            <div>
              <h2 className="heading-classic text-3xl md:text-4xl">Start with a single image.</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                Free forever, no ads, no algorithm. Upload, get your own
                profile, and share links that preview beautifully everywhere.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/register" className="btn-accent justify-center whitespace-nowrap">
                Create account
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Link>
              <Link href="/login" className="btn-ghost justify-center whitespace-nowrap">
                I already have one
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
