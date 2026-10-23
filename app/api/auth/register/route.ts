import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Never bootstrap ADMIN through public registration —
    // admin role is granted only via ADMIN_EMAIL/ADMIN_PASSWORD in lib/auth.ts.
    const user = await prisma.user.create({
      data: {
        email: normalized,
        name: typeof name === "string" && name.trim() ? name.trim().slice(0, 100) : null,
        role: "USER",
        passwordHash: await hash(password, 12),
      },
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
