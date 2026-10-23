import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AlbumCard from "@/components/media/AlbumCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Albums",
};

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    include: {
      _count: { select: { posts: true } },
      author: { select: { name: true, role: true } },
      posts: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 1, select: { url: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-classic py-16 md:py-24">
      <div className="mb-14 max-w-2xl">
        <p className="label-caps mb-4">Collections</p>
        <h1 className="heading-classic text-4xl md:text-6xl">Albums</h1>
        <p className="mt-5 text-ink-soft">
          Curated groupings — each album gathers related shots under one cover.
        </p>
      </div>

      {albums.length === 0 ? (
        <p className="text-sm text-ink-faint">No albums yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a, i) => (
            <AlbumCard
              key={a.id}
              id={a.id}
              title={a.title}
              coverUrl={a.posts[0]?.url ?? a.coverUrl ?? null}
              postCount={a._count.posts}
              authorName={a.author.name}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
