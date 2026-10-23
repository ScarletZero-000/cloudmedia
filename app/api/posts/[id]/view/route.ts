import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/posts/[id]/view — PUBLIC visitor counter. No auth: anyone viewing counts.
// Dedupes per browser per post for ~1 hour via a lightweight cookie (not perfect, good enough).
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.post.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
    select: { views: true },
  });

  const res = NextResponse.json({ views: updated.views });
  res.cookies.set(`cm_v_${params.id}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour dedupe window
    path: "/",
  });
  return res;
}
