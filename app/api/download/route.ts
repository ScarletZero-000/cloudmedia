import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/download?url=... — proxies a Blob image with Content-Disposition:
// attachment so browsers actually DOWNLOAD instead of navigating to the file.
export async function GET(req: NextRequest) {
  const target = new URL(req.url).searchParams.get("url");
  // only allow our own Blob host — open proxy = security hole
  if (!target || !/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(target)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const upstream = await fetch(target);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }

  const ctype = upstream.headers.get("content-type") ?? "application/octet-stream";
  const ext = ctype.includes("png") ? "png" : ctype.includes("webp") ? "webp" : ctype.includes("gif") ? "gif" : ctype.includes("avif") ? "avif" : "jpg";

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": ctype,
      "Content-Disposition": `attachment; filename="cloudmedia-${Date.now()}.${ext}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
