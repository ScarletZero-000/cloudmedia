import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FollowButton from "@/components/profile/FollowButton";
import { computeXp, levelProgress, tierForLevel } from "@/lib/levels";
import ProfileEditor from "@/components/profile/ProfileEditor";
import MediaCard from "@/components/feed/MediaCard";
import { BadgeCheck } from "lucide-react";
import type { PostDTO } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, image: true, role: true, createdAt: true,
      _count: { select: { posts: true, comments: true, followersIn: true } },
    },
  });
  if (!user) notFound();

  const posts = await prisma.post.findMany({
    where: { authorId: user.id, published: true, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      album: { select: { id: true, title: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  const postDTOs = posts as unknown as PostDTO[];

  // level system: uploads drive xp most, likes reward quality, comments participation
  const likesReceived = posts.reduce((sum, post) => sum + (post._count as any).likes, 0);
  const xp = computeXp(user._count.posts, likesReceived, user._count.comments);
  const lvl = levelProgress(xp);
  const tier = tierForLevel(lvl.level);

  return (
    <div className="container-classic py-12 md:py-16">
      {/* profile header — hard card */}
      <section className={`card-hard mb-10 p-[3px] ${tier.color}`}>
        <div className="border-2 border-ink p-[3px]">
          <div className="flex flex-col items-start gap-6 bg-paper-raised p-6 sm:flex-row sm:items-center md:p-10">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-ink bg-paper-dim md:h-32 md:w-32">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? "Avatar"} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-serif text-4xl font-bold text-ink-faint">
              {(user.name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="heading-classic flex items-center gap-2.5 text-3xl md:text-4xl">
            {user.name ?? "Anonymous"}
            {user.role === "ADMIN" && (
              <BadgeCheck className="h-7 w-7 text-blue-500" strokeWidth={2} aria-label="Verified admin" />
            )}
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-faint">
            Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <div className="mt-4 flex gap-6 text-sm">
            <span><b className="font-bold">{user._count.posts}</b> <span className="text-ink-faint">uploads</span></span>
            <span><b className="font-bold">{user._count.comments}</b> <span className="text-ink-faint">comments</span></span>
            <span><b className="font-bold">{user._count.followersIn}</b> <span className="text-ink-faint">followers</span></span>
            {user.role === "ADMIN" && (
              <span className="border-2 border-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-caps text-accent">
                Admin
              </span>
            )}
          </div>
        </div>
          <div className="flex shrink-0 flex-col items-start gap-3">
            <ProfileEditor userId={user.id} initialName={user.name} initialImage={user.image} />
            <FollowButton userId={user.id} />
          </div>
        </div>
      </div>
      </section>

      {/* level strip */}
      <section className="card-line mb-16 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center border-2 ${tier.color} bg-paper-dim`}>
            <span className="heading-classic text-2xl">{lvl.level}</span>
          </div>
          <div>
            <p className={`label-caps ${tier.chip} border px-2 py-0.5 inline-block`}>{tier.name}</p>
            <p className="mt-1.5 text-sm text-ink-soft">
              <b className="font-bold">{xp.toLocaleString()}</b> XP · {lvl.need} XP to level {lvl.level + 1}
            </p>
          </div>
        </div>
        <div className="w-full md:max-w-sm">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-caps text-ink-faint">
            <span>Level {lvl.level}</span>
            <span>Level {lvl.level + 1}</span>
          </div>
          <div className="mt-1.5 h-3 border-2 border-ink bg-paper-dim">
            <div className="h-full bg-accent transition-all" style={{ width: `${lvl.pct}%` }} />
          </div>
        </div>
      </section>

      {/* their uploads */}
      <section>
        <h2 className="label-caps mb-8">Uploads</h2>
        {postDTOs.length === 0 ? (
          <p className="text-sm text-ink-faint">No uploads yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {postDTOs.map((post, i) => (
              <MediaCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
