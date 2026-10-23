import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/posts?cursor=&limit=&albumId=&authorId=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 12), 50);
  const cursor = searchParams.get("cursor") ?? undefined;
  const albumId = searchParams.get("albumId") ?? undefined;
  const authorId = searchParams.get("authorId") ?? undefined;

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      status: "APPROVED", // public feed shows approved content only
      ...(albumId && { albumId }),
      ...(authorId && { authorId }),
    },
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      album: { select: { id: true, title: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;

  return NextResponse.json({
    posts: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}
