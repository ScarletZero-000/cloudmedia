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

// GET /api/albums — list all albums (for the albums section page)
export async function GET() {
  const albums = await prisma.album.findMany({
    include: { _count: { select: { posts: true } }, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ albums });
}

// DELETE /api/albums?id=... — owner or admin only; posts are detached (albumId → null)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Album id required" }, { status: 400 });

  const album = await prisma.album.findUnique({ where: { id }, select: { authorId: true } });
  if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  if (album.authorId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // detach posts first (schema uses SetNull, but be explicit)
  await prisma.post.updateMany({ where: { albumId: id }, data: { albumId: null } });
  await prisma.album.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
