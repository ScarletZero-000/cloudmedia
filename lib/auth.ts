import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

type Role = "ADMIN" | "USER";

export const authOptions: NextAuthOptions = {
  // adapter omitted intentionally: credentials provider is JWT-based;
  // PrismaAdapter is used only if you enable OAuth providers later.
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        // ---- Admin bootstrap: exact match against env credentials ----
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
          // Provision the admin account on first login so the DB always
          // has a real user row for foreign keys.
          const admin = await prisma.user.upsert({
            where: { email },
            update: { role: "ADMIN" },
            create: {
              email,
              name: "Admin",
              role: "ADMIN",
              // hash is a random value — the env password is the real secret
              passwordHash: await hash(crypto.randomUUID(), 12),
            },
          });
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            image: admin.image,
            role: admin.role,
          } as any;
        }

        // ---- Normal user login (bcrypt hash in DB) ----
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.passwordHash) return null;
        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role as Role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}
