import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fire-and-forget notification creator — call from like/comment/moderation flows.
// Never throws: notifications must not break the action that caused them.
export async function notify(opts: {
  userId: string;
  actorId?: string | null;
  type: "like" | "comment" | "reply" | "approved" | "rejected";
  postId?: string | null;
  message: string;
}) {
  try {
    // don't notify people about their own actions
    if (opts.actorId && opts.actorId === opts.userId) return;
    await prisma.notification.create({
      data: {
        userId: opts.userId,
        actorId: opts.actorId ?? null,
        type: opts.type,
        postId: opts.postId ?? null,
        message: opts.message,
      },
    });
  } catch (e: any) {
    console.warn("notification skip:", e?.code ?? e);
  }
}
