import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/albums { title, description? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const album = await prisma.album.create({
    data: {
      title: String(title).slice(0, 200),
      description: description ?? null,
      authorId: session.user.id,
    },
  });
  return NextResponse.json({ album }, { status: 201 });
}

// GET /api/albums — list own albums (or all if ?all=1)
export async function GET(req: NextRequest) {
  const all = new URL(req.url).searchParams.get("all");
  const session = await getServerSession(authOptions);

  const albums = await prisma.album.findMany({
    where: all ? {} : session ? { authorId: session.user.id } : {},
    include: { _count: { select: { posts: true } }, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ albums });
}
