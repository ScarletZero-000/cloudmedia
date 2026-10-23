"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PostDTO } from "@/types";
import RichText from "@/components/editor/RichText";
import { MessageCircle, BadgeCheck } from "lucide-react";

export default function MediaCard({ post, index }: { post: PostDTO; index: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.08 }}
      className="card-line group flex flex-col"
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
        <div className="flex items-center justify-between">
          <p className="label-caps">
            {post.album ? post.album.title : post.type.toLowerCase()}
          </p>
          <span className="flex items-center gap-1.5 text-xs text-ink-faint">
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            {post._count.comments}
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
    </motion.article>
  );
}
