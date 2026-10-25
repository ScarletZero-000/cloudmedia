"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PostDTO } from "@/types";
import { useSession } from "next-auth/react";
import MediaCard from "@/components/feed/MediaCard";
import { ArrowDown, LoaderCircle, Search, X, UsersRound } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function Feed({ initialPosts, initialCursor }: { initialPosts: PostDTO[]; initialCursor: string | null }) {
  const { data: session } = useSession();
  const me = session?.user as { id?: string; role?: string } | undefined;
  const [posts, setPosts] = useState<PostDTO[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(!initialCursor);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"new" | "top">("new");
  const [scope, setScope] = useState<"all" | "following">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || done || !cursor) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({ cursor: cursor, limit: "12", sort });
      if (query) params.set("q", query);
      if (scope === "following") params.set("scope", "following");
      if (activeTag) params.set("tag", activeTag);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts((p) => [...p, ...data.posts]);
      setCursor(data.nextCursor);
      if (!data.nextCursor) setDone(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cursor, done, query, sort]);

  // reload from the top when search/sort changes (debounced 350ms for typing)
  const reload = useCallback(
    (q: string, s: "new" | "top", sc: "all" | "following" = "all", tg: string | null = null) => {
      loadingRef.current = true;
      setLoading(true);
      const params = new URLSearchParams({ limit: "12", sort: s });
      if (q) params.set("q", q);
      if (sc === "following") params.set("scope", "following");
      if (tg) params.set("tag", tg);
      fetch(`/api/posts?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setPosts(Array.isArray(data.posts) ? data.posts : []);
          setCursor(data.nextCursor);
          setDone(!data.nextCursor);
        })
        .catch(() => {})
        .finally(() => {
          loadingRef.current = false;
          setLoading(false);
        });
    },
    []
  );

  const onQuery = (v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => reload(v.trim(), sort), 350);
  };

  const onSort = (s: "new" | "top") => {
    if (s === sort) return;
    setSort(s);
    reload(query.trim(), s);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // deep link support: /feed?tag=anime pre-filters the feed
  const searchParams = useSearchParams();
  useEffect(() => {
    const t = searchParams.get("tag");
    if (t) {
      setActiveTag(t);
      reload("", "new", "all", t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // restore scroll position when coming BACK to the feed (bfcache usually
  // handles it, but force-dynamic pages often don't) — save on leave, restore
  // after first paint on return.
  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem("cm_feed_scroll", String(window.scrollY));
      } catch {}
    };
    const restore = () => {
      try {
        const y = Number(sessionStorage.getItem("cm_feed_scroll") ?? "0");
        if (y > 0) window.scrollTo(0, y);
      } catch {}
    };
    window.addEventListener("pagehide", save);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    // restore once after mount
    const t = setTimeout(restore, 60);
    return () => {
      window.removeEventListener("pagehide", save);
      clearTimeout(t);
    };
  }, []);

  // IntersectionObserver instead of scroll listener:
  // fires off the main thread, doesn't jank scrolling on low-end phones.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || done) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "800px 0px" } // prefetch well before reaching the bottom
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, done]);

  return (
    <div className="container-classic py-16 md:py-24">
      <div className="mb-12 max-w-2xl animate-[card-in_0.4s_ease-out_both]">
        <p className="label-caps mb-4">The Collection</p>
        <h1 className="heading-classic text-4xl md:text-6xl">Media, curated &amp; shared.</h1>
        <p className="mt-5 text-ink-soft">
          Images and video from the community — grouped into albums, annotated with care, open to everyone.
        </p>
      </div>

      {/* search + sort bar */}
      <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={2} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search posts or authors…"
            aria-label="Search the feed"
            className="input-classic pl-11"
          />
          {query && (
            <button
              onClick={() => onQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </button>
          )}
        </div>
        {me && (
          <button
            onClick={() => {
              const next = scope === "all" ? "following" : "all";
              setScope(next);
              reload(query.trim(), sort, next, activeTag);
            }}
            aria-pressed={scope === "following"}
            className={`inline-flex items-center gap-1.5 border-2 px-4 py-2.5 text-xs font-bold transition-colors ${
              scope === "following"
                ? "border-accent bg-accent text-paper"
                : "border-ink-soft bg-paper-raised text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            <UsersRound className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Following
          </button>
        )}
        <div className="flex gap-0" role="tablist" aria-label="Sort feed">
          {(["new", "top"] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={sort === s}
              onClick={() => onSort(s)}
              className={`border-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                sort === s
                  ? "border-ink bg-ink text-paper"
                  : "border-ink-soft bg-paper-raised text-ink-soft hover:border-ink hover:text-ink"
              } ${s === "new" ? "rounded-l-none" : "-ml-0.5 rounded-r-none"}`}
            >
              {s === "new" ? "Newest" : "Most liked"}
            </button>
          ))}
        </div>
      </div>

      {activeTag && (
        <button
          onClick={() => {
            setActiveTag(null);
            reload(query.trim(), sort, scope, null);
          }}
          className="mb-8 inline-flex items-center gap-2 border-2 border-accent bg-accent/5 px-3 py-1.5 text-xs font-bold text-accent"
        >
          #{activeTag}
          <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
        </button>
      )}

      {posts.length === 0 ? (
        <div className="border-2 border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-sm font-semibold text-ink-faint">
            {query ? `Nothing matches “${query}”. Try another word.` : "Nothing here yet. Be the first to upload."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <MediaCard key={post.id} post={post} index={i} canDelete={Boolean(me && (me.role === "ADMIN" || me.id === post.author.id))} />
          ))}
        </div>
      )}

      {/* sentinel for infinite scroll */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      <div className="mt-16 flex justify-center">
        {loading ? (
          <span className="flex items-center gap-2 text-sm text-ink-faint">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> Loading
          </span>
        ) : done ? (
          <span className="flex items-center gap-2 label-caps">
            <ArrowDown className="h-3.5 w-3.5" aria-hidden /> End of feed
          </span>
        ) : (
          <button onClick={loadMore} className="btn-ghost">
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
