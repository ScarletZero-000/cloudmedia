import { prisma } from "@/lib/prisma";
import { computeXp, levelProgress, tierForLevel } from "@/lib/levels";

// ProfileHeader: hard-card with decorative double border, level ring, XP bar.
// Purely presentational data fetching lives in the page; this is a server component.
export default async function ProfileHeaderData({ userId }: { userId: string }) {
  const agg = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      _count: { select: { posts: true, comments: true } },
      posts: { select: { _count: { select: { likes: true } } } },
    },
  });
  if (!agg) return null;
  const likesReceived = agg.posts.reduce((sum, p) => sum + p._count.likes, 0);
  const xp = computeXp(agg._count.posts, likesReceived, agg._count.comments);
  return { xp, ...levelProgress(xp), tier: tierForLevel(levelProgress(xp).level) };
}
