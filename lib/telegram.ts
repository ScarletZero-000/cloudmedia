/**
 * Notify admin chat when a new upload arrives (PENDING) or gets approved.
 * Called fire-and-forget from upload/approve routes.
 */
export async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = (process.env.TELEGRAM_ADMIN_ID ?? "").split(",")[0]?.trim();
  if (!token || !chatId) return; // silently skip if not configured

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
    });
  } catch (err) {
    console.error("notifyTelegram failed", err);
  }
}
