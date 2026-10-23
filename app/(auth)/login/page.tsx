"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoaderCircle, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-classic flex min-h-[70vh] items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <p className="label-caps mb-4">Welcome back</p>
        <h1 className="heading-classic mb-10 text-3xl">Sign in</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="label-caps mb-2 block">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input-classic"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="label-caps mb-2 block">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-classic"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-classic w-full justify-center disabled:pointer-events-none disabled:opacity-40"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            )}
            Sign in
          </button>
        </form>

        <p className="mt-8 text-sm text-ink-faint">
          No account yet?{" "}
          <a href="/register" className="text-ink underline underline-offset-2">
            Register
          </a>
        </p>
      </motion.div>
    </div>
  );
}
