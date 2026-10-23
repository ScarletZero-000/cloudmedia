import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/notifications — list mine (newest 30) + unread count
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      include: {
        actor: { select: { id: true, name: true, image: true, role: true } },
        post: { select: { id: true, slug: true, title: true, url: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);

  return NextResponse.json({ notifications: items, unread });
}

// POST /api/notifications { action: "read-all" } — mark everything read
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, message } = await req.json();
  if (action === "read-all") {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  // ADMIN ONLY: broadcast an announcement to every member
  if (action === "announce") {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const text = typeof message === "string" ? message.trim().slice(0, 500) : "";
    if (!text) return NextResponse.json({ error: "message required" }, { status: 400 });

    const users = await prisma.user.findMany({ select: { id: true } });
    // createMany is far faster on a big user base; skip the actor-self-dedupe
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        actorId: session.user.id,
        type: "announcement",
        message: text,
      })),
    });
    return NextResponse.json({ ok: true, delivered: users.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
