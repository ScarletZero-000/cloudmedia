import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/admin/users/ban { id, reason } | DELETE ?id= — admin-only ban toggle.
// Banned users: role set to BANNED-ish behavior via a Ban row; checked at login.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, reason } = await req.json();
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot ban yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Cannot ban an admin" }, { status: 400 });
  }

  await prisma.ban.upsert({
    where: { userId: id },
    update: { reason: typeof reason === "string" ? reason.slice(0, 200) : null },
    create: { userId: id, reason: typeof reason === "string" ? reason.slice(0, 200) : null },
  });
  return NextResponse.json({ ok: true, banned: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.ban.deleteMany({ where: { userId: id } });
  return NextResponse.json({ ok: true, banned: false });
}
