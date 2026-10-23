"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, Image as ImageIcon, MessageCircle, Eye, Trash2, ShieldCheck, ShieldOff,
  Check, X, Clock,
} from "lucide-react";

type AdminUser = {
  id: string; name: string | null; email: string; role: "ADMIN" | "USER";
  createdAt: string | Date;
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
}: {
  users: AdminUser[];
  posts: AdminPost[];
  pendingPosts: PendingPost[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const totals = {
    users: users.length,
    posts: posts.length,
    comments: posts.reduce((a, p) => a + p._count.comments, 0),
  };

  async function act(key: string, fn: () => Promise<any>) {
    setBusyId(key);
    try {
      await fn();
      startTransition(() => router.refresh());
    } catch (e) {
      alert("Action failed. Check permissions and try again.");
    } finally {
      setBusyId(null);
    }
  }

  const setRole = (id: string, role: "ADMIN" | "USER") =>
    act(`u-${id}`, () =>
      fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      })
    );

  const deleteUser = (id: string) => {
    if (!confirm("Delete this user and all their content?")) return;
    act(`u-${id}`, () => fetch(`/api/admin/users?id=${id}`, { method: "DELETE" }));
  };

  const deletePost = (id: string) => {
    if (!confirm("Delete this image permanently?")) return;
    act(`p-${id}`, () => fetch(`/api/posts/${id}`, { method: "DELETE" }));
  };

  const approve = (id: string) =>
    act(`pp-${id}`, () =>
      fetch("/api/admin/posts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, action: "APPROVE" }),
      })
    );

  const reject = (id: string) => {
    if (!confirm("Reject and delete this upload? The user will need to re-upload.")) return;
    act(`pp-${id}`, () =>
      fetch("/api/admin/posts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, action: "REJECT" }),
      })
    );
  };

  return (
    <div className="container-classic py-16 md:py-24">
      <div className="mb-16 max-w-2xl">
        <p className="label-caps mb-4">Administration</p>
        <h1 className="heading-classic text-4xl md:text-6xl">Console</h1>
        <p className="mt-5 text-ink-soft">
          Manage members, moderate uploads, and watch how the platform is used.
        </p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4"
      >
        <Stat icon={<Users className="h-4 w-4" strokeWidth={1.75} aria-hidden />} label="Users" value={totals.users} />
        <Stat icon={<ImageIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden />} label="Recent images" value={totals.posts} />
        <Stat icon={<MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />} label="Comments" value={totals.comments} />
        <Stat icon={<Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />} label="Views / 30d" value="—" />
      </motion.div>

      {/* Pending approvals */}
      <section className="mb-20">
        <h2 className="label-caps mb-6 flex items-center gap-2">
          <Clock className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Pending approvals
          {pendingPosts.length > 0 && (
            <span className="ml-1 border border-ink px-2 py-0.5 text-[11px]">{pendingPosts.length}</span>
          )}
        </h2>
        {pendingPosts.length === 0 ? (
          <p className="text-sm text-ink-faint">Queue is clear. Nothing awaiting review.</p>
        ) : (
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {pendingPosts.map((p) => (
              <div key={p.id} className="flex flex-col bg-paper-raised">
                <div className="aspect-[4/3] overflow-hidden border-b border-line bg-paper-dim">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-5">
                  <h3 className="heading-classic text-lg">{p.title}</h3>
                  <p className="text-xs text-ink-faint">
                    {p.author.name ?? "Anonymous"} · {p.author.email}
                  </p>
                  <div className="mt-auto flex gap-2 pt-4">
                    <button
                      onClick={() => approve(p.id)}
                      disabled={busyId === `pp-${p.id}` || pending}
                      className="btn-classic flex-1 justify-center py-2 text-xs disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      Approve
                    </button>
                    <button
                      onClick={() => reject(p.id)}
                      disabled={busyId === `pp-${p.id}` || pending}
                      className="btn-ghost flex-1 justify-center py-2 text-xs disabled:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Users */}
      <section className="mb-20">
        <h2 className="label-caps mb-6">Members</h2>
        <div className="overflow-x-auto border border-line bg-paper-raised">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="label-caps px-5 py-3 text-left font-medium">User</th>
                <th className="label-caps px-5 py-3 text-left font-medium">Images</th>
                <th className="label-caps px-5 py-3 text-left font-medium">Comments</th>
                <th className="label-caps px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-4">
                    <div className="font-medium">{u.name ?? "—"}</div>
                    <div className="text-xs text-ink-faint">{u.email}</div>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{u._count.posts}</td>
                  <td className="px-5 py-4 text-ink-soft">{u._count.comments}</td>
                  <td className="px-5 py-4">
                    <span className="label-caps">{u.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn
                        title={u.role === "ADMIN" ? "Demote to user" : "Promote to admin"}
                        disabled={busyId === `u-${u.id}` || pending}
                        onClick={() => setRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                      >
                        {u.role === "ADMIN"
                          ? <ShieldOff className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                          : <ShieldCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
                      </IconBtn>
                      <IconBtn
                        title="Delete user"
                        disabled={busyId === `u-${u.id}` || pending}
                        onClick={() => deleteUser(u.id)}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Posts */}
      <section>
        <h2 className="label-caps mb-6">Recent uploads</h2>
        <div className="overflow-x-auto border border-line bg-paper-raised">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="label-caps px-5 py-3 text-left font-medium">Title</th>
                <th className="label-caps px-5 py-3 text-left font-medium">Author</th>
                <th className="label-caps px-5 py-3 text-left font-medium">Status</th>
                <th className="label-caps px-5 py-3 text-left font-medium">Comments</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-xs truncate px-5 py-4 font-medium">{p.title}</td>
                  <td className="px-5 py-4 text-ink-soft">{p.author.name ?? "—"}</td>
                  <td className="px-5 py-4"><span className="label-caps">{p.status}</span></td>
                  <td className="px-5 py-4 text-ink-soft">{p._count.comments}</td>
                  <td className="px-5 py-4 text-right">
                    <IconBtn
                      title="Delete image"
                      disabled={busyId === `p-${p.id}` || pending}
                      onClick={() => deletePost(p.id)}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </IconBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-paper-raised px-6 py-7">
      <div className="mb-3 flex items-center gap-2 text-ink-faint">
        {icon}
        <span className="label-caps">{label}</span>
      </div>
      <p className="heading-classic text-3xl">{value}</p>
    </div>
  );
}

function IconBtn({
  children, title, onClick, disabled,
}: {
  children: React.ReactNode; title: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="p-2 text-ink-faint transition-colors hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
