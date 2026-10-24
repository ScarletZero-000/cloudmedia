import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ADMIN: set a user's level override. body: { userId, level } — level 0/null clears override.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const level = body?.level;
  if (!userId || (level !== null && (typeof level !== "number" || level < 0 || level > 99))) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { levelOverride: level === null || level === 0 ? null : Math.floor(level) },
    select: { id: true, levelOverride: true },
  });
  return NextResponse.json({ ok: true, levelOverride: user.levelOverride });
}
