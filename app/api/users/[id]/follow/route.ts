import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/users/[id]/follow — toggle follow. Login required, can't follow self.
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.id === params.id) {
    return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const key = { followerId_followingId: { followerId: session.user.id, followingId: params.id } };
  const existing = await prisma.follow.findUnique({ where: key });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: session.user.id, followingId: params.id } });
  }

  const [followers, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: params.id } }),
    prisma.follow.count({ where: { followerId: params.id } }),
  ]);
  return NextResponse.json({ isFollowing: !existing, followers, following: followingCount });
}

// GET — follower counts + whether I follow them
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const [followers, followingCount, meFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: params.id } }),
    prisma.follow.count({ where: { followerId: params.id } }),
    session?.user
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: session.user.id, followingId: params.id } },
        })
      : Promise.resolve(null),
  ]);
  return NextResponse.json({ followers, following: followingCount, isFollowing: Boolean(meFollowing) });
}
