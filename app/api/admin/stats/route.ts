import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/admin/stats — dashboard aggregate stats
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [users, posts, albums, comments, pageViews30, uploads30, topPosts, dailyViews] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.album.count(),
      prisma.comment.count(),
      prisma.analytics.count({ where: { event: "page_view", createdAt: { gte: since30 } } }),
      prisma.analytics.count({ where: { event: "upload", createdAt: { gte: since30 } } }),
      prisma.post.findMany({
        orderBy: { comments: { _count: "desc" } },
        take: 5,
        select: { id: true, title: true, _count: { select: { comments: true } } },
      }),
      prisma.analytics.groupBy({
        by: ["createdAt"],
        where: { event: "page_view", createdAt: { gte: since30 } },
        _count: { _all: true },
      }),
    ]);

  // bucket daily counts client-side is fine; return raw
  return NextResponse.json({
    totals: { users, posts, albums, comments, pageViews30, uploads30 },
    topPosts,
    dailyViews,
  });
}
