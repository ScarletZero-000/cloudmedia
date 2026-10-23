import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyTelegram } from "@/lib/telegram";
import { isBanned } from "@/lib/ban";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (await isBanned(session.user.id)) {
    return NextResponse.json({ error: "Your account is banned. Contact an admin." }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const albumId = formData.get("albumId") as string | null;
    const title = (formData.get("title") as string | null)?.trim() || null;
    // description arrives as a JSON string of rich blocks — parse defensively
    let description: { type: string; text: string }[] | null = null;
    try {
      const raw = formData.get("description");
      if (typeof raw === "string" && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          description = parsed
            .filter((b: any) => b && typeof b.text === "string" && b.text.trim())
            .map((b: any) => ({ type: String(b.type ?? "paragraph"), text: b.text.slice(0, 500) }))
            .slice(0, 10);
          if (!description.length) description = null;
        }
      }
    } catch {
      description = null;
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const { type, ext } = classify(file.type);
    if (!type) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 }
      );
    }

    const max = MAX_IMAGE_BYTES;
    if (file.size > max) {
      return NextResponse.json(
        { error: `File too large. Max ${max / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    // tags: comma-separated, max 5, lowercase, slug-safe
    const rawTags = ((formData.get("tags") as string | null) ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""))
      .filter(Boolean);
    const tagList = Array.from(new Set(rawTags)).slice(0, 5);

    if (albumId) {
      const album = await prisma.album.findUnique({ where: { id: albumId } });
      if (!album || album.authorId !== session.user.id) {
        return NextResponse.json({ error: "Album not found" }, { status: 404 });
      }
    }

    const blob = await put(`media/${session.user.id}/${Date.now()}-${sanitize(file.name) || `file.${ext}`}`,
      file, {
        access: "public",
        addRandomSuffix: true,
      });

    // human-readable slug from title — falls back to a short random tail
    const baseTitle = (title || file.name.replace(/\.[^.]+$/, "")).trim();
    let baseSlug =
      baseTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60) || "post";
    // ensure uniqueness: check DB, append -2, -3… if taken
    let slug = baseSlug;
    let n = 2;
    while (await prisma.post.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const post = await prisma.post.create({
      data: {
        title: title || file.name.replace(/\.[^.]+$/, ""),
        slug,
        ...(description ? { description } : {}),
        ...(tagList.length ? { tags: tagList } : {}),
        type,
        url: blob.url,
        size: file.size,
        authorId: session.user.id,
        albumId: albumId ?? null,
        // Approval flow: admins publish instantly, regular users need review
        status: session.user.role === "ADMIN" ? "APPROVED" : "PENDING",
        // thumbnailUrl / width / height can be filled by client-side probing
      },
    });

    // analytics is best-effort — never fail the upload because of it
    await prisma.analytics.create({
      data: { event: "upload", userId: session.user.id, postId: post.id },
    }).catch((e) => console.warn("analytics skip:", e?.code ?? e));

    if (post.status === "PENDING") {
      notifyTelegram(
        [
          "<b>Upload baru menunggu approve</b>",
          "",
          `Judul: ${post.title}`,
          `Oleh: ${session.user.name ?? session.user.email}`,
          "",
          `Approve via bot: /approve ${post.id}`,
        ].join("\n")
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

function classify(mime: string): { type: "IMAGE" | null; ext: string } {
  if (ALLOWED_IMAGE.includes(mime)) return { type: "IMAGE", ext: mime.split("/")[1] };
  return { type: null, ext: "" };
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}
