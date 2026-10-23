import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Telegram bot webhook for CloudMedia.
 * Commands: /start, /stats, /pending, /approve <id> (admin only)
 * Also receives notifications glue: this endpoint only handles Telegram updates.
 */

const API = (token: string, method: string) =>
  `https://api.telegram.org/bot${token}/${method}`;

const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_ID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAdmin(chatId: string) {
  return ADMIN_IDS.includes(chatId);
}

async function send(token: string, chatId: string, text: string) {
  await fetch(API(token, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      // disable web page previews so bot replies stay compact
      link_preview_options: { is_disabled: true },
    }),
  });
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: true }); // bot not configured — stay silent

  // optional secret verification header set via Telegram setWebhook
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expected && secretHeader !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = update.message;
  const chatId: string | undefined = msg?.chat?.id?.toString();
  const text: string = (msg?.text ?? "").trim();

  if (!chatId || !text.startsWith("/")) {
    return NextResponse.json({ ok: true });
  }

  const [cmdRaw, ...args] = text.split(/\s+/);
  const cmd = cmdRaw.split("@")[0].toLowerCase();
  const admin = isAdmin(chatId);

  try {
    if (cmd === "/start") {
      await send(
        token,
        chatId,
        [
          "<b>CloudMedia Bot</b>",
          "",
          "/stats — ringkasan situs",
          admin ? "/pending — post nunggu approve" : "",
          admin ? "/approve &lt;id&gt; — setujui post" : "",
          "",
          "Kamu terhubung sebagai " + (admin ? "admin." : "pengunjung."),
        ]
          .filter(Boolean)
          .join("\n")
      );
    } else if (cmd === "/stats") {
      const [posts, users, pending] = await Promise.all([
        prisma.post.count({ where: { status: "APPROVED" } }),
        prisma.user.count(),
        prisma.post.count({ where: { status: "PENDING" } }),
      ]);
      await send(
        token,
        chatId,
        [
          "<b>CloudMedia — Stats</b>",
          "",
          `Post approved: <b>${posts}</b>`,
          `Post pending: <b>${pending}</b>`,
          `Users: <b>${users}</b>`,
        ].join("\n")
      );
    } else if (cmd === "/pending" && admin) {
      const pend = await prisma.post.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 10,
        select: { id: true, title: true, author: { select: { name: true } } },
      });
      if (!pend.length) {
        await send(token, chatId, "Tidak ada post yang menunggu approve.");
      } else {
        await send(
          token,
          chatId,
          [
            "<b>Pending queue</b>",
            "",
            ...pend.map(
              (p) => `• <code>${p.id}</code> — ${p.title} (${p.author.name ?? "?"})`
            ),
            "",
            "Approve: /approve &lt;id&gt;",
          ].join("\n")
        );
      }
    } else if (cmd === "/approve" && admin) {
      const id = args[0];
      if (!id) {
        await send(token, chatId, "Pakai: /approve &lt;postId&gt;");
      } else {
        const p = await prisma.post.update({
          where: { id },
          data: { status: "APPROVED" },
          select: { title: true },
        }).catch(() => null);
        await send(
          token,
          chatId,
          p ? `Approved: <b>${p.title}</b>` : `Post dengan id itu gak ada.`
        );
      }
    } else if ((cmd === "/pending" || cmd === "/approve") && !admin) {
      await send(token, chatId, "Perintah ini khusus admin.");
    }
  } catch (err) {
    console.error("telegram webhook error", err);
    await send(token, chatId, "Terjadi error di server. Coba lagi nanti.").catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
