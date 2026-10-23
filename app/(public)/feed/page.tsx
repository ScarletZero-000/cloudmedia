import { prisma } from "@/lib/prisma";
import Feed from "@/components/feed/Feed";
import type { PostDTO } from "@/types";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const posts = await prisma.post.findMany({
    where: { published: true, status: "APPROVED" },
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      album: { select: { id: true, title: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 13,
  });

  const hasMore = posts.length > 12;
  const items = hasMore ? posts.slice(0, 12) : posts;

  return (
    <Feed
      initialPosts={JSON.parse(JSON.stringify(items)) as PostDTO[]}
      initialCursor={hasMore ? items[items.length - 1].id : null}
    />
  );
}
