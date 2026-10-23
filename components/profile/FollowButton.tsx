"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserCheck, LoaderCircle } from "lucide-react";

// Follow/unfollow toggle for profile pages. Shows live follower count.
export default function FollowButton({ userId }: { userId: string }) {
  const [state, setState] = useState<{ following: boolean; isFollowing: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${userId}/follow`)
      .then((r) => r.json())
      .then((d) => setState({ following: d.followers ?? 0, isFollowing: Boolean(d.isFollowing) }))
      .catch(() => setState(null));
  }, [userId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setState({ following: d.followers, isFollowing: d.isFollowing });
    } catch {} finally {
      setBusy(false);
    }
  }

  if (!state) return null; // not signed in or still loading — guests see nothing here

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 border-2 px-4 py-2 text-xs font-bold transition-all ${
        state.isFollowing
          ? "border-ink bg-paper-raised text-ink hover:border-accent hover:text-accent"
          : "border-accent bg-accent text-paper hover:bg-accent-hover hover:border-accent-hover"
      } disabled:opacity-60`}
      title={state.isFollowing ? "Unfollow" : "Follow this member"}
    >
      {busy ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={2} aria-hidden />
      ) : state.isFollowing ? (
        <UserCheck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      ) : (
        <UserPlus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      )}
      {state.isFollowing ? "Following" : "Follow"}
      <span className="ml-1 font-mono text-[10px] opacity-70">{state.following}</span>
    </button>
  );
}
