import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Client-side error sink: browser errors are POSTed here so the operator can read them.
// Stored in analytics (event: "client-error: ...") — best-effort, never throws.
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const raw = `${String(body?.message ?? "unknown").slice(0, 300)} @ ${String(body?.url ?? "?").slice(0, 150)}`.slice(0, 460);
    await prisma.analytics.create({
      data: { event: `client-error: ${raw}` },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  try {
    const rows = await prisma.analytics.findMany({
      where: { event: { startsWith: "client-error" } },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { event: true, createdAt: true },
    });
    return NextResponse.json({ errors: rows });
  } catch {
    return NextResponse.json({ errors: [] });
  }
}
