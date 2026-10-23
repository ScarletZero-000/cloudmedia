import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/posts?cursor=&limit=&albumId=&authorId=&q=&sort=new|top
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 12), 50);
  const cursor = searchParams.get("cursor") ?? undefined;
  const albumId = searchParams.get("albumId") ?? undefined;
  const authorId = searchParams.get("authorId") ?? undefined;
  const q = searchParams.get("q")?.trim();
  const sort = searchParams.get("sort") === "top" ? "top" : "new";
  const tag = searchParams.get("tag")?.trim();
  const scope = searchParams.get("scope") === "following" ? "following" : "all";

  // following scope: only posts from people I follow
  let followIds: string[] | null = null;
  if (scope === "following") {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ posts: [], nextCursor: null });
    const follows = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    followIds = follows.map((f) => f.followingId);
    if (followIds.length === 0) return NextResponse.json({ posts: [], nextCursor: null });
  }

  // "top" = most liked in the last 7 days; Prisma can't order by relation count
  // with a cursor cleanly, so we fetch a window and sort in memory.
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      status: "APPROVED", // public feed shows approved content only
      ...(albumId && { albumId }),
      ...(authorId && { authorId }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { author: { name: { contains: q, mode: "insensitive" } } },
        ],
      }),
      ...(tag && { tags: { has: tag.toLowerCase() } }),
      ...(followIds && { authorId: { in: followIds } }),
    },
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      album: { select: { id: true, title: true } },
      _count: { select: { comments: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: sort === "top" ? 100 : limit + 1,
    ...(sort === "new" && cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  if (sort === "top") {
    posts.sort((a, b) => b._count.likes - a._count.likes || +b.createdAt - +a.createdAt);
    const start = cursor ? posts.findIndex((p) => p.id === cursor) + 1 : 0;
    const items = posts.slice(start, start + limit);
    const nextCursor = start + limit < posts.length ? items[items.length - 1].id : null;
    return NextResponse.json({ posts: items, nextCursor });
  }

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;

  return NextResponse.json({
    posts: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}
