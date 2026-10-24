import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, FolderOpen } from "lucide-react";

export const dynamic = "force-dynamic";

// Album detail: editorial header (cover, count, author) + masonry-ish grid.
export default async function AlbumPage({ params }: { params: { id: string } }) {
  let album = null;
  try {
    album = await prisma.album.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      posts: {
        where: { published: true, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true, role: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  });
  } catch {
    notFound();
  }
  if (!album) notFound();

  const cover = album.posts[0];

  return (
    <div className="container-classic py-12 md:py-16">
      <Link href="/albums" className="mb-8 inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        All albums
      </Link>

      <header className="card-hard mb-16 grid gap-0 overflow-hidden md:grid-cols-[2fr_3fr]">
        <div className="bg-ink">
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={cover.url} alt={album.title} className="h-64 w-full object-cover opacity-90 md:h-full" />
          ) : (
            <div className="flex h-64 items-center justify-center md:h-full">
              <FolderOpen className="h-10 w-10 text-paper/40" strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>
        <div className="p-8 md:p-10">
          <p className="label-caps mb-3">Album</p>
          <h1 className="heading-classic text-4xl md:text-5xl">{album.title}</h1>
          <p className="mt-4 text-sm text-ink-soft">
            Curated by <b className="font-bold">{album.author.name ?? "Anonymous"}</b>
            {" · "}
            {album.posts.length} {album.posts.length === 1 ? "image" : "images"}
          </p>
        </div>
      </header>

      {album.posts.length === 0 ? (
        <div className="border-2 border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-sm font-semibold text-ink-faint">This album is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {album.posts.map((post, i) => (
            <Link key={post.id} href={`/post/${post.slug || post.id}`} className="card-line group block">
              <div className="overflow-hidden border-b-2 border-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.url}
                  alt={post.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <h3 className="heading-classic text-lg">{post.title}</h3>
                <p className="mt-1.5 text-xs text-ink-faint">
                  {post.author.name ?? "Anonymous"} · {post._count.likes} likes · {post._count.comments} comments
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
