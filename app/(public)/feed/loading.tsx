import FeedSkeleton from "@/components/feed/FeedSkeleton";

// Streaming fallback while the feed's server data resolves.
export default function FeedLoading() {
  return <FeedSkeleton />;
}
