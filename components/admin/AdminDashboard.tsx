"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import ConfirmDialog, { type ConfirmState } from "@/components/ui/ConfirmDialog";
import {
  Users, Image as ImageIcon, MessageCircle, Clock, Trash2, ShieldCheck, ShieldOff, Megaphone, LoaderCircle, Ban,
  Check, X, TriangleAlert, CircleCheck,
} from "lucide-react";

type AdminUser = {
  id: string; name: string | null; email: string; role: "ADMIN" | "USER";
  createdAt: string | Date;
  isBanned?: boolean;
  levelOverride?: number | null;
  _count: { posts: number; comments: number };
};

type AdminPost = {
  id: string; title: string; url: string; type: "IMAGE";
  createdAt: string | Date;
  status: "PENDING" | "APPROVED";
  author: { name: string | null };
  _count: { comments: number };
};

type PendingPost = {
  id: string; title: string; url: string;
  createdAt: string | Date;
  author: { id: string; name: string | null; email: string };
};

export default function AdminDashboard({
  users,
  posts,
  pendingPosts,
  albums,
}: {
  users: AdminUser[];
  posts: AdminPost[];
  pendingPosts: PendingPost[];
  albums: { id: string; title: string; _count: { posts: number } }[];
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [announceMsg, setAnnounceMsg] = useState("");
  const [announcing, setAnnouncing] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const totals = {
    users: users.length,
    posts: posts.length,
    comments: posts.reduce((a, p) => a + p._count.comments, 0),
    pending: pendingPosts.length,
  };

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function act(key: string, okMsg: string, fn: () => Promise<any>) {
    setBusyId(key);
    try {
      await fn();
      flash(okMsg);
      startTransition(() => router.refresh());
    } catch {
      flash("Action failed — check permissions.");
    } finally {
      setBusyId(null);
    }
  }

  const setBan = (id: string, banned: boolean) =>
    act(`b-${id}`, banned ? "User banned — they can no longer upload, comment or like" : "User unbanned", () =>
      banned
        ? fetch("/api/admin/users/ban", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          })
        : fetch(`/api/admin/users/ban?id=${id}`, { method: "DELETE" })
    );

  const setRole = (id: string, role: "ADMIN" | "USER") =>
    act(`u-${id}`, role === "ADMIN" ? "User promoted to admin" : "User demoted", () =>
      fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      })
    );

  const deleteUser = (id: string) =>
    setConfirmState({
      title: "Delete this user?",
      body: "All their uploads and comments are removed too. This cannot be undone.",
      confirmLabel: "Delete user", danger: true,
      onConfirm: () => act(`u-${id}`, "User deleted", () => fetch(`/api/admin/users?id=${id}`, { method: "DELETE" })),
    });

  const deletePost = (id: string) =>
    setConfirmState({
      title: "Delete this image?",
      body: "Removed from the feed permanently.",
      confirmLabel: "Delete", danger: true,
      onConfirm: () => act(`p-${id}`, "Image deleted", () => fetch(`/api/posts/${id}`, { method: "DELETE" })),
    });

  const approve = (id: string) =>
    act(`pp-${id}`, "Upload approved — now live in the feed", () =>
      fetch("/api/admin/posts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, action: "APPROVE" }),
      })
    );

  const reject = (id: string) =>
    setConfirmState({
      title: "Reject this upload?",
      body: "The user will need to re-upload.",
      confirmLabel: "Reject", danger: true,
      onConfirm: () => act(`pp-${id}`, "Upload rejected", () =>
        fetch("/api/admin/posts/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: id, action: "REJECT" }),
        })
      ),
    });

  // albums management
  const [newAlbum, setNewAlbum] = useState("");
  const createAlbum = () => {
    if (!newAlbum.trim()) return;
    act("album-new", "Album created", () =>
      fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newAlbum.trim() }),
      }).then(() => setNewAlbum(""))
    );
  };

  const setLevel = async (id: string, level: number) => {
    setBusyId(`lv-${id}`);
    try {
      const res = await fetch("/api/admin/users/level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, level }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };
  const deleteAlbum = (id: string) =>
    setConfirmState({
      title: "Delete this album?",
      body: "Its photos stay — they just become ungrouped.",
      confirmLabel: "Delete", danger: true,
      onConfirm: () => act(`al-${id}`, "Album deleted", () => fetch(`/api/albums?id=${id}`, { method: "DELETE" })),
    });

  return (
    <div className="container-classic py-16 md:py-24">
      {/* header */}
      <div className="mb-14 max-w-2xl">
        <p className="label-caps mb-4 flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-accent" aria-hidden />
          Administration
        </p>
        <h1 className="heading-classic text-4xl md:text-6xl">Console</h1>
        <p className="mt-5 text-ink-soft">
          Manage members, moderate uploads, and watch how the platform is used.
        </p>
      </div>

      {/* stats — hard cards */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <Stat accent icon={<Users className="h-4 w-4" strokeWidth={2} aria-hidden />} label="Users" value={totals.users} />
        <Stat icon={<ImageIcon className="h-4 w-4" strokeWidth={2} aria-hidden />} label="Uploads" value={totals.posts} />
        <Stat icon={<MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />} label="Comments" value={totals.comments} />
        <Stat
          warn={totals.pending > 0}
          icon={<Clock className="h-4 w-4" strokeWidth={2} aria-hidden />}
          label="Pending"
          value={totals.pending}
        />
      </motion.div>

      {/* Pending approvals */}
      <section className="mb-20">
        <h2 className="label-caps mb-6 flex items-center gap-2.5">
          Pending approvals
          {totals.pending > 0 ? (
            <span className="border-2 border-accent bg-accent px-2 py-0.5 text-[11px] font-bold text-paper">
              {totals.pending}
            </span>
          ) : (
            <CircleCheck className="h-4 w-4 text-ink-faint" strokeWidth={2} aria-hidden />
          )}
        </h2>
        {pendingPosts.length === 0 ? (
          <div className="border-2 border-dashed border-line-strong px-6 py-10 text-center">
            <p className="text-sm font-semibold text-ink-faint">Queue is clear — nothing awaiting review.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pendingPosts.map((p) => (
              <motion.div
                key={p.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="card-hard flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden border-b-2 border-ink bg-paper-dim">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <h3 className="heading-classic text-lg">{p.title}</h3>
                  <p className="text-xs font-medium text-ink-faint">
                    {p.author.name ?? "Anonymous"} · {p.author.email}
                  </p>
                  <div className="mt-auto flex gap-2.5 pt-5">
                    <button
                      onClick={() => approve(p.id)}
                      disabled={busyId === `pp-${p.id}` || pending}
                      className="btn-accent flex-1 justify-center py-2.5 text-xs disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                      Approve
                    </button>
                    <button
                      onClick={() => reject(p.id)}
                      disabled={busyId === `pp-${p.id}` || pending}
                      className="btn-ghost flex-1 justify-center py-2.5 text-xs disabled:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Albums management */}
      <section className="mb-20">
        <h2 className="label-caps mb-6">Albums</h2>
        <div className="card-line mb-6 flex flex-col gap-3 p-5 sm:flex-row">
          <input
            className="input-classic flex-1"
            placeholder="New album title…"
            value={newAlbum}
            maxLength={200}
            onChange={(e) => setNewAlbum(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createAlbum()}
          />
          <button onClick={createAlbum} disabled={busyId === "album-new" || pending || !newAlbum.trim()} className="btn-accent justify-center disabled:opacity-40">
            Create album
          </button>
        </div>
        {albums.length === 0 ? (
          <p className="text-sm text-ink-faint">No albums yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {albums.map((a) => (
              <span key={a.id} className="flex items-center gap-2 border-2 border-ink bg-paper-raised px-3 py-2 text-sm font-bold">
                {a.title}
                <span className="text-xs font-semibold text-ink-faint">{a._count.posts}</span>
                <button
                  onClick={() => deleteAlbum(a.id)}
                  disabled={busyId === `al-${a.id}` || pending}
                  className="text-ink-faint transition-colors hover:text-accent disabled:opacity-30"
                  title="Delete album"
                  aria-label={`Delete album ${a.title}`}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Announcement broadcast */}
      <section className="mb-20">
        <h2 className="label-caps mb-6">Announcement</h2>
        <div className="card-hard p-6">
          <p className="mb-3 text-sm text-ink-soft">
            Send a notification to every member&apos;s bell at once. Keep it short — it shows in their dropdown.
          </p>
          <textarea
            rows={3}
            maxLength={500}
            value={announceMsg}
            onChange={(e) => setAnnounceMsg(e.target.value)}
            placeholder="e.g. Server maintenance tonight at 11 PM — uploads may be briefly unavailable."
            className="input-classic resize-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-mono text-ink-faint">{announceMsg.length}/500</span>
            <button
              onClick={async () => {
                if (!announceMsg.trim() || announcing) return;
                setAnnouncing(true);
                try {
                  const res = await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "announce", message: announceMsg.trim() }),
                  });
                  if (!res.ok) throw new Error();
                  setToast(`Announcement sent to all members`);
                  setAnnounceMsg("");
                } catch {
                  setToast("Failed to send announcement");
                } finally {
                  setAnnouncing(false);
                }
              }}
              disabled={announcing || !announceMsg.trim()}
              className="btn-accent disabled:pointer-events-none disabled:opacity-40"
            >
              {announcing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Megaphone className="h-4 w-4" strokeWidth={2} aria-hidden />}
              {announcing ? "Sending…" : "Send to everyone"}
            </button>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="mb-20">
        <h2 className="label-caps mb-6">Members</h2>
        <div className="card-line overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-paper-dim">
                <th className="label-caps px-5 py-3.5 text-left">User</th>
                <th className="label-caps px-5 py-3.5 text-left">Images</th>
                <th className="label-caps px-5 py-3.5 text-left">Comments</th>
                <th className="label-caps px-5 py-3.5 text-left">Role</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-paper-dim/60">
                  <td className="px-5 py-4">
                    <div className="font-bold">{u.name ?? "—"}</div>
                    <div className="text-xs text-ink-faint">{u.email}</div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-ink-soft">{u._count.posts}</td>
                  <td className="px-5 py-4 font-semibold text-ink-soft">{u._count.comments}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block border-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-caps ${
                      u.role === "ADMIN" ? "border-accent text-accent" : "border-ink-soft text-ink-soft"
                    }`}>
                      {u.role}
                    </span>
                    {u.isBanned && (
                      <span className="ml-1.5 inline-block border-2 border-red-600 bg-red-600/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-caps text-red-600">
                        Banned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <IconBtn
                        title={u.role === "ADMIN" ? "Demote to user" : "Promote to admin"}
                        disabled={busyId === `u-${u.id}` || pending}
                        onClick={() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                      >
                        {u.role === "ADMIN"
                          ? <ShieldOff className="h-4 w-4" strokeWidth={2} aria-hidden />
                          : <ShieldCheck className="h-4 w-4" strokeWidth={2} aria-hidden />}
                      </IconBtn>
                      <div className="flex items-center border-2 border-ink-soft">
                        <button
                          type="button"
                          disabled={busyId === `lv-${u.id}`}
                          onClick={() => setLevel(u.id, Math.max(0, (u.levelOverride ?? 1) - 1))}
                          className="px-2 py-1 text-xs font-bold text-ink-soft hover:text-accent disabled:opacity-40"
                          title="Level -1 (0 = auto from XP)"
                          aria-label="Decrease level"
                        >-</button>
                        <span className="min-w-[3.5rem] border-x-2 border-ink-soft px-1 py-1 text-center text-[11px] font-bold text-ink">
                          Lv {u.levelOverride ?? "auto"}
                        </span>
                        <button
                          type="button"
                          disabled={busyId === `lv-${u.id}`}
                          onClick={() => setLevel(u.id, (u.levelOverride ?? 0) + 1)}
                          className="px-2 py-1 text-xs font-bold text-ink-soft hover:text-accent disabled:opacity-40"
                          title="Level +1"
                          aria-label="Increase level"
                        >+</button>
                      </div>
                      <IconBtn
                        title={u.isBanned ? "Unban user" : "Ban user (blocks uploads, comments and likes)"}
                        disabled={busyId === `b-${u.id}` || pending || u.role === "ADMIN"}
                        onClick={() => setBan(u.id, !u.isBanned)}
                      >
                        <Ban className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </IconBtn>
                      <IconBtn
                        title="Delete user" danger
                        disabled={busyId === `u-${u.id}` || pending}
                        onClick={() => deleteUser(u.id)}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Uploads */}
      <section>
        <h2 className="label-caps mb-6">Recent uploads</h2>
        <div className="card-line overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-paper-dim">
                <th className="label-caps px-5 py-3.5 text-left">Title</th>
                <th className="label-caps px-5 py-3.5 text-left">Author</th>
                <th className="label-caps px-5 py-3.5 text-left">Status</th>
                <th className="label-caps px-5 py-3.5 text-left">Comments</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-paper-dim/60">
                  <td className="max-w-xs truncate px-5 py-4 font-bold">{p.title}</td>
                  <td className="px-5 py-4 font-medium text-ink-soft">{p.author.name ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block border-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-caps ${
                      p.status === "APPROVED" ? "border-ink text-ink" : "border-accent text-accent"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-ink-soft">{p._count.comments}</td>
                  <td className="px-5 py-4 text-right">
                    <IconBtn
                      title="Delete image" danger
                      disabled={busyId === `p-${p.id}` || pending}
                      onClick={() => deletePost(p.id)}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </IconBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />

      {/* toast */}
      {toast && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border-2 border-ink bg-ink px-5 py-3 text-sm font-bold text-paper shadow-[4px_4px_0_0_#b3401e]"
          role="status"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}

function Stat({
  icon, label, value, accent, warn,
}: {
  icon: React.ReactNode; label: string; value: number | string; accent?: boolean; warn?: boolean;
}) {
  return (
    <div className={`card-hard px-5 py-6 ${accent ? "border-ink bg-ink text-paper" : ""}`}>
      <div className={`mb-3 flex items-center gap-2 ${accent ? "text-paper/60" : warn ? "text-accent" : "text-ink-faint"}`}>
        {icon}
        <span className={`label-caps ${accent ? "!text-paper/60" : ""}`}>{label}</span>
      </div>
      <p className={`heading-classic text-4xl ${warn && !accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}

function IconBtn({
  children, title, onClick, disabled, danger,
}: {
  children: React.ReactNode; title: string; onClick: () => void; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`border p-2 transition-all disabled:opacity-30 ${
        danger
          ? "border-transparent text-ink-faint hover:border-accent hover:text-accent"
          : "border-transparent text-ink-faint hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
