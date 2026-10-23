"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoaderCircle, UserRoundPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");

      // auto sign-in after registration
      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
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
        <p className="label-caps mb-4">Join the community</p>
        <h1 className="heading-classic mb-10 text-3xl">Create account</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="label-caps mb-2 block">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="input-classic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              className="input-classic"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
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
              <UserRoundPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            )}
            Create account
          </button>
        </form>

        <p className="mt-8 text-sm text-ink-faint">
          Already have an account?{" "}
          <a href="/login" className="text-ink underline underline-offset-2">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
