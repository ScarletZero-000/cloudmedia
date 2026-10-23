import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RichText from "@/components/editor/RichText";
import CommentSection from "@/components/feed/CommentSection";
import EditPostButton from "@/components/feed/EditPostButton";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import type { RichBlock } from "@/types";

export const dynamic = "force-dynamic";

// Per-post Open Graph metadata: every page ships its OWN thumbnail,
// so WhatsApp/Twitter previews show that post's image — not a generic one.
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
      url: true,
      thumbnailUrl: true,
      author: { select: { name: true } },
    },
  });
  if (!post) return { title: "Not found — CloudMedia" };

  const blocks = post.description as RichBlock[] | null;
  const plain =
    blocks?.[0]?.type === "paragraph"
      ? String(blocks[0].text).slice(0, 160)
      : undefined;
  const img = post.thumbnailUrl || post.url;

  return {
    title: `${post.title} — CloudMedia`,
    description: plain ?? `By ${post.author.name ?? "Anonymous"} on CloudMedia.`,
    openGraph: {
      title: post.title,
      description: plain ?? `By ${post.author.name ?? "Anonymous"} on CloudMedia.`,
      images: [{ url: img }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: post.title,
      images: [img],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await prisma.post.findFirst({
    // slug-or-id route: /post/senju-karakagi AND legacy /post/cmvl… both work
    where: { OR: [{ slug: params.id }, { id: params.id }] },
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      album: { select: { id: true, title: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post || !post.published) notFound();

  const session = await getServerSession(authOptions);
  const canEdit = Boolean(session?.user && (session.user.id === post.authorId || session.user.role === "ADMIN"));

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
        <div className="flex items-start justify-between gap-4">
          <h1 className="heading-classic text-4xl md:text-5xl">{post.title}</h1>
          <EditPostButton
            post={{
              id: post.id,
              title: post.title,
              description: post.description as { type: string; text: string }[] | null,
              url: post.url,
              canEdit,
            }}
          />
        </div>
        <div className="mt-5 flex items-center gap-3 text-sm text-ink-faint">
          <span className="flex items-center gap-1.5">
            {post.author.name ?? "Anonymous"}
            {post.author.role === "ADMIN" && (
              <BadgeCheck className="h-4 w-4 text-blue-500" strokeWidth={2} aria-label="Verified admin" />
            )}
          </span>
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
