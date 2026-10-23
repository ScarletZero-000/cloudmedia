import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/comments?postId=
export async function GET(req: NextRequest) {
  const postId = new URL(req.url).searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { author: { select: { id: true, name: true, image: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

// POST /api/comments { postId, body }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, body } = await req.json();
  if (!postId || typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "postId and body required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      body: body.trim().slice(0, 2000),
      postId,
      authorId: session.user.id,
    },
    include: { author: { select: { id: true, name: true, image: true, role: true } } },
  });

  await prisma.analytics.create({
    data: { event: "comment", userId: session.user.id, postId },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
