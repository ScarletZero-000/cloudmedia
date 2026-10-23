import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// POST /api/comments/image (multipart: file) — uploads a comment image to Blob, returns URL.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF or AVIF allowed." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max image size is 10 MB." }, { status: 413 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-40) || "image";
  const blob = await put(
    `comments/${session.user.id}/${Date.now()}-${safe}`,
    file,
    { access: "public", addRandomSuffix: true }
  );

  return NextResponse.json({ url: blob.url });
}
