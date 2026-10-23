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

// POST /api/comments { postId, body, parentId? } — supports threaded replies
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, body, parentId, imageUrl } = await req.json();
  // a comment needs text, an image, or both
  if (
    !postId ||
    (typeof body !== "string" || !body.trim()) && typeof imageUrl !== "string"
  ) {
    return NextResponse.json({ error: "postId and (body or imageUrl) required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // if replying, the parent must exist on the same post
  let parentIdValue: string | null = null;
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true },
    });
    if (!parent || parent.postId !== postId) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
    parentIdValue = parentId;
  }

  const comment = await prisma.comment.create({
    data: {
      body: typeof body === "string" ? body.trim().slice(0, 2000) : "",
      imageUrl: typeof imageUrl === "string" && imageUrl.startsWith("https://") ? imageUrl : null,
      postId,
      authorId: session.user.id,
      parentId: parentIdValue,
    },
    include: { author: { select: { id: true, name: true, image: true, role: true } } },
  });

  // analytics is best-effort — never fail the comment because of it
  await prisma.analytics.create({
    data: { event: "comment", userId: session.user.id, postId },
  }).catch((e) => console.warn("analytics skip:", e?.code ?? e));

  return NextResponse.json({ comment }, { status: 201 });
}

// DELETE /api/comments?id=... — author or admin
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Comment id required" }, { status: 400 });

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  if (comment.authorId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // delete replies first (no FK cascade on self-relation)
  await prisma.comment.deleteMany({ where: { parentId: id } });
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
