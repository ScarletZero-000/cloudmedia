"use client";

import type { PostDTO } from "@/types";
import RichText from "@/components/editor/RichText";
import { MessageCircle, BadgeCheck } from "lucide-react";
import DeletePostButton from "@/components/feed/DeletePostButton";
import LikeButton from "@/components/feed/LikeButton";

export default function MediaCard({
  post,
  index,
  canDelete = false,
}: {
  post: PostDTO;
  index: number;
  canDelete?: boolean;
}) {
  // NOTE: no JS-driven entrance animation here. Framer's whileInView starts cards
  // at opacity:0 — if hydration stalls on a slow phone, the whole feed looks blank.
  // CSS animation degrades gracefully: content is ALWAYS visible without JS.
  return (
    <article
      className="card-line group flex flex-col animate-[card-in_0.5s_ease-out_both]"
      style={{ animationDelay: `${(index % 3) * 0.08}s` }}
    >
      <a href={`/post/${(post as any).slug || post.id}`} className="block overflow-hidden border-b-2 border-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.url}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover will-change-transform transition-transform duration-500 ease-out-expo group-hover:scale-[1.02]"
        />
      </a>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {canDelete && (
          <div className="flex justify-end">
            <DeletePostButton postId={post.id} title={post.title} className="!px-0" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="label-caps">
            {post.album ? post.album.title : post.type.toLowerCase()}
          </p>
          <span className="flex items-center gap-3 text-xs text-ink-faint">
            <LikeButton
              postId={post.id}
              initialLikes={post._count.likes ?? 0}
              compact
            />
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              {post._count.comments}
            </span>
          </span>
        </div>

        <h3 className="heading-classic text-xl">{post.title}</h3>

        {post.description && <RichText blocks={post.description.slice(0, 2)} />}

        <div className="mt-auto flex items-center justify-between pt-2 text-sm text-ink-faint">
          <span className="flex items-center gap-1">
            {post.author.name ?? "Anonymous"}
            {post.author.role === "ADMIN" && (
              <BadgeCheck className="h-4 w-4 text-blue-500" strokeWidth={2} aria-label="Verified admin" />
            )}
          </span>
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </time>
        </div>
      </div>
    </article>
  );
}
