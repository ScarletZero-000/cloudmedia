import { prisma } from "@/lib/prisma";

// Ban check used by protected routes. A Ban row = user cannot write
// (upload/comment/like); reading stays open. Returns true when banned.
export async function isBanned(userId: string): Promise<boolean> {
  const ban = await prisma.ban.findUnique({ where: { userId }, select: { id: true } });
  return Boolean(ban);
}
