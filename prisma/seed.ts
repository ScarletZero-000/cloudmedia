/**
 * Seed: 1 admin + 3 users, 2 albums, 12 approved posts + 2 pending,
 * and comments — so the site never looks empty after db push.
 * Run: npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const PIC = (n: number) =>
  `https://picsum.photos/seed/cm-seed-${n}/1200/900`;

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@cloudmedia.app";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "admin12345";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await hash(adminPass, 12),
    },
  });

  const users: Awaited<ReturnType<typeof prisma.user.upsert>>[] = [];
  for (const n of ["alya", "raka", "nadia"]) {
    users.push(
      await prisma.user.upsert({
        where: { email: `${n}@cloudmedia.app` },
        update: {},
        create: {
          email: `${n}@cloudmedia.app`,
          name: n[0].toUpperCase() + n.slice(1),
          role: "USER" as const,
          passwordHash: await hash(`${n}12345`, 12),
        },
      })
    );
  }

  const travel = await prisma.album.upsert({
    where: { id: "seed-album-travel" },
    update: {},
    create: {
      id: "seed-album-travel",
      title: "Travel 2026",
      authorId: admin.id,
    },
  }).catch(() => prisma.album.findUniqueOrThrow({ where: { id: "seed-album-travel" } }));

  const studio = await prisma.album.upsert({
    where: { id: "seed-album-studio" },
    update: {},
    create: {
      id: "seed-album-studio",
      title: "Studio — Ink & Paper",
      authorId: admin.id,
    },
  }).catch(() => prisma.album.findUniqueOrThrow({ where: { id: "seed-album-studio" } }));

  const existing = await prisma.post.count();
  if (existing > 0) {
    console.log(`Posts already exist (${existing}) — skipping post seed.`);
    return;
  }

  const titles = [
    "Morning in the highlands", "Concrete study no. 4", "Ink & paper tests",
    "Coastline, off-season", "Window light", "Grid compositions",
    "Fog on the ridge", "Studio corner", "Salt & shadow",
    "The long road north", "Paper textures", "Dusk over the water",
  ];
  const authors = [admin, ...users];

  await prisma.post.createMany({
    data: titles.map((t, i) => ({
      title: t,
      type: "IMAGE" as const,
      url: PIC(i + 1),
      width: 1200,
      height: 900,
      status: (i < 10 ? "APPROVED" : "PENDING") as "APPROVED" | "PENDING",
      authorId: authors[i % authors.length].id,
      albumId: i % 2 === 0 ? travel.id : studio.id,
      description: [
        { type: "paragraph", text: "Shot on a quiet afternoon — " + t.toLowerCase() + ". Notes on framing and light are in the comments." },
      ],
    })),
  });

  const posts = await prisma.post.findMany({ take: 10 });
  await prisma.comment.createMany({
    data: posts.slice(0, 6).map((p, i) => ({
      body: [
        "This composition is excellent.",
        "The tones here are so calm — love it.",
        "Any chance of a full-res album?",
        "Great light on this one.",
        "Saved. That's all I can say.",
        "The texture detail is unreal.",
      ][i],
      postId: p.id,
      authorId: users[i % users.length].id,
    })),
  });

  console.log("Seed complete: 1 admin, 3 users, 2 albums, 12 posts (10 approved / 2 pending), 6 comments.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
