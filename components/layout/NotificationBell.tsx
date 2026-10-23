"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Bell, X } from "lucide-react";

type Notif = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  actor: { id: string; name: string | null; image: string | null } | null;
  post: { id: string; slug: string | null; title: string } | null;
};

// Bell in the header with an unread badge; dropdown lists the last 30.
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[] | null>(null);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/notifications")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!alive || !d) return;
          setItems(d.notifications);
          setUnread(d.unread);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 30000); // light poll every 30s
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function markAll() {
    setUnread(0);
    setItems((list) => list?.map((n) => ({ ...n, read: true })) ?? null);
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read-all" }),
    }).catch(() => {});
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-paper transition-colors hover:text-accent"
        aria-label={`Notifications${unread ? ` — ${unread} unread` : ""}`}
      >
        <Bell className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center border-2 border-ink bg-accent px-0.5 text-[9px] font-bold leading-none text-paper">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] border-2 border-ink bg-paper-raised shadow-[6px_6px_0_0_#0c0c0c]"
            role="menu"
          >
            <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
              <p className="label-caps">Notifications</p>
              {unread > 0 && (
                <button onClick={markAll} className="text-[11px] font-bold text-accent hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items === null ? (
                <p className="px-4 py-6 text-sm text-ink-faint">Loading…</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-ink-faint">Nothing yet. Likes and comments land here.</p>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className={`border-b border-line px-4 py-3 last:border-0 ${n.read ? "" : "bg-accent/5"} ${n.type === "announcement" ? "border-l-4 border-l-accent" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-ink bg-paper-dim">
                          {n.actor?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={n.actor.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-ink-faint">
                              {(n.actor?.name ?? "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-snug text-ink-soft">{n.message}</p>
                          {n.post && (
                            <Link
                              href={`/post/${n.post.slug || n.post.id}`}
                              onClick={() => setOpen(false)}
                              className="mt-0.5 block truncate text-[11px] font-bold text-accent hover:underline"
                            >
                              {n.post.title}
                            </Link>
                          )}
                          <time className="mt-0.5 block text-[10px] text-ink-faint" dateTime={n.createdAt}>
                            {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </time>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
