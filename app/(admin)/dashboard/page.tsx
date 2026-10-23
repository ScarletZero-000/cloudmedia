import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Console" };

export default async function AdminDashboardPage() {
  const [users, posts, pendingPosts, albums] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.post.findMany({
      select: {
        id: true, title: true, url: true, type: true, createdAt: true, status: true,
        author: { select: { name: true, role: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.post.findMany({
      where: { status: "PENDING" },
      select: {
        id: true, title: true, url: true, createdAt: true,
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" }, // oldest first — fair queue order
    }),
    prisma.album.findMany({
      select: { id: true, title: true, _count: { select: { posts: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <AdminDashboard users={users} posts={posts} pendingPosts={pendingPosts} albums={albums} />;
}
