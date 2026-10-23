import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Images } from "lucide-react";

type AlbumCardProps = {
  id: string;
  title: string;
  coverUrl: string | null;
  postCount: number;
  authorName: string | null;
  index?: number;
};

export default function AlbumCard({
  id,
  title,
  coverUrl,
  postCount,
  authorName,
  index = 0,
}: AlbumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.08 }}
    >
      <Link
        href={`/album/${id}`}
        className="card-line group block transition-colors hover:border-line-strong"
      >
        <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper-dim">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Images className="h-8 w-8 text-line-strong" strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-6">
          <p className="label-caps">
            Album · {postCount} {postCount === 1 ? "image" : "images"}
          </p>
          <h3 className="heading-classic text-xl">{title}</h3>
          {authorName && (
            <p className="text-sm text-ink-faint">{authorName}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
