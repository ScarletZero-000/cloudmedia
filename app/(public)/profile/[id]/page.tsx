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
      id: true, name: true, image: true, role: true,
        levelOverride: true, createdAt: true,
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
  const natural = levelProgress(xp);
  const override = (user as any).levelOverride as number | null | undefined;
  const lvl = override && override > 0
    ? { ...natural, level: override, pct: 100, need: 0, into: 0 }
    : natural;
  const tier = tierForLevel(lvl.level);

  return (
    <div className="container-classic py-12 md:py-16">
      {/* profile header — hard card */}
      <section className={`card-hard mb-10 p-[3px] ${tier.ring}`}>
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
      <section className="card-hard mb-16 p-[3px]" style={{ borderColor: undefined }}>
        <div className={`border-2 p-[3px] ${tier.ring}`}>
          <div className="flex flex-col items-stretch gap-6 bg-paper-raised p-6 sm:flex-row sm:items-center md:justify-between md:p-8">
            {/* badge: solid color square with rotated ink frame */}
            <div className="flex items-center gap-6">
              <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center ${tier.bg} shadow-[5px_5px_0_0_#0c0c0c]`}>
                <span className="font-serif text-3xl font-bold text-paper">{lvl.level}</span>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-ink bg-paper px-2 py-px text-[9px] font-bold uppercase tracking-caps text-ink">
                  {tier.name}
                </span>
              </div>
              <div className="min-w-0">
                <p className="label-caps">Rank</p>
                <p className="heading-classic mt-1 text-xl md:text-2xl">
                  {override ? `Level ${lvl.level}` : `Level ${lvl.level}`}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  <b className="font-bold text-ink">{xp.toLocaleString()} XP</b>
                  {override ? " · set by admin" : ` · ${lvl.need} XP to level ${lvl.level + 1}`}
                </p>
              </div>
            </div>
            {/* xp bar */}
            {!override && (
              <div className="w-full sm:max-w-xs">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-caps text-ink-faint">
                  <span>Lv {lvl.level}</span>
                  <span>Lv {lvl.level + 1}</span>
                </div>
                <div className="mt-2 h-4 border-2 border-ink bg-paper-dim shadow-[3px_3px_0_0_#0c0c0c]">
                  <div className="h-full bg-accent" style={{ width: `${lvl.pct}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-ink-faint">{lvl.into} / {lvl.next - lvl.current} XP</p>
              </div>
            )}
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
