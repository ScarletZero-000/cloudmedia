import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// PATCH /api/profile — update name (and optionally avatar file via multipart)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let name: string | null | undefined;
    let imageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const rawName = form.get("name");
      name = typeof rawName === "string" && rawName.trim() ? rawName.trim().slice(0, 60) : null;

      const file = form.get("avatar") as File | null;
      if (file && file.size > 0) {
        if (!ALLOWED.includes(file.type)) {
          return NextResponse.json({ error: "Avatar must be JPEG, PNG, or WebP" }, { status: 415 });
        }
        if (file.size > MAX_AVATAR_BYTES) {
          return NextResponse.json({ error: "Avatar max 5MB" }, { status: 413 });
        }
        const blob = await put(`avatars/${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60)}`, file, {
          access: "public",
          addRandomSuffix: true,
        });
        imageUrl = blob.url;
      }
    } else {
      const body = await req.json();
      name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 60) : null;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(imageUrl ? { image: imageUrl } : {}),
      },
      select: { id: true, name: true, image: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("profile update error", err);
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }
}
