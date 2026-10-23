import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RichText from "@/components/editor/RichText";
import CommentSection from "@/components/feed/CommentSection";
import { ArrowLeft } from "lucide-react";
import type { RichBlock } from "@/types";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      album: { select: { id: true, title: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post || !post.published) notFound();

  const description = post.description as RichBlock[] | null;
  const ratio =
    post.width && post.height ? `${post.width} / ${post.height}` : "4 / 3";

  return (
    <article className="container-classic py-12 md:py-16">
      <Link
        href="/feed"
        className="mb-8 inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Back to feed
      </Link>

      <header className="mb-10 max-w-3xl">
        {post.album && (
          <p className="label-caps mb-4">
            <Link href={`/album/${post.album.id}`} className="hover:text-ink">
              {post.album.title}
            </Link>
          </p>
        )}
        <h1 className="heading-classic text-4xl md:text-5xl">{post.title}</h1>
        <div className="mt-5 flex items-center gap-3 text-sm text-ink-faint">
          <span>{post.author.name ?? "Anonymous"}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.createdAt.toISOString()}>
            {post.createdAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span aria-hidden>·</span>
          <span>{post._count.comments} comments</span>
        </div>
      </header>

      <figure className="border border-line bg-paper-raised">
        <Image
          src={post.url}
          alt={post.title}
          width={post.width ?? 1200}
          height={post.height ?? 900}
          priority
          className="h-auto w-full object-contain"
          style={{ aspectRatio: ratio }}
          sizes="(min-width: 1120px) 1120px, 100vw"
        />
      </figure>

      {description && description.length > 0 && (
        <div className="mx-auto max-w-2xl py-12">
          <RichText blocks={description} />
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <CommentSection postId={post.id} />
      </div>
    </article>
  );
}
