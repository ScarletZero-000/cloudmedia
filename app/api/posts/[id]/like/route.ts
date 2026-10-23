import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { isBanned } from "@/lib/ban";

export const runtime = "nodejs";

// POST /api/posts/[id]/like — toggle like. Login required; one like per user per post.
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (await isBanned(session.user.id)) {
    return NextResponse.json({ error: "Your account is banned. Contact an admin." }, { status: 403 });
  }

  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { id: true, authorId: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id;
  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId: params.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, postId: params.id } });
    if (post.authorId !== userId) {
      notify({
        userId: post.authorId,
        actorId: userId,
        type: "like",
        postId: params.id,
        message: `${session.user.name ?? "Someone"} liked your post.`,
      });
    }
  }

  const count = await prisma.like.count({ where: { postId: params.id } });
  return NextResponse.json({ liked: !existing, count });
}

// GET /api/posts/[id]/like — public count + whether the current viewer liked it
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const count = await prisma.like.count({ where: { postId: params.id } });
  let liked = false;
  if (session?.user) {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: params.id } },
    });
    liked = Boolean(existing);
  }
  return NextResponse.json({ count, liked });
}
