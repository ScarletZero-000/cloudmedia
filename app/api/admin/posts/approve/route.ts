import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/admin/posts/approve { postId, action: "APPROVE" | "REJECT" }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { postId, action } = await req.json();
  if (!postId || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "postId and valid action required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  if (action === "APPROVE") {
    await prisma.post.update({ where: { id: postId }, data: { status: "APPROVED" } });
    return NextResponse.json({ ok: true, status: "APPROVED" });
  }

  // REJECT: remove the post entirely (blob object stays orphaned — acceptable
  // for now; wire up del() from @vercel/blob if cleanup is wanted)
  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ ok: true, status: "REJECTED" });
}
