import Link from "next/link";
import { ArrowRight, Images, UploadCloud, MessageCircle } from "lucide-react";
import HeroVideo from "@/components/layout/HeroVideo";

export default function LandingPage() {
  return (
    <div className="container-classic">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <HeroVideo />
        <p className="label-caps mb-6">A media platform, done properly</p>
        <h1 className="heading-classic max-w-3xl text-5xl md:text-7xl">
          Where images live, and conversations begin.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
          CloudMedia is a place to publish photographs, group them into albums,
          and write about them with structure — then let the community respond.
          No noise. No clutter. Just the work.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/feed" className="btn-classic">
            Browse the feed
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
          <Link href="/upload" className="btn-ghost">
            <UploadCloud className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Upload an image
          </Link>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-line py-20">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Images className="mb-5 h-6 w-6" strokeWidth={1.5} aria-hidden />
            <h2 className="heading-classic mb-3 text-2xl">Media engine</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Images upload straight to blob storage and return permanent URLs.
              Group them into albums, add dimensions and titles automatically.
            </p>
          </div>
          <div>
            <MessageCircle className="mb-5 h-6 w-6" strokeWidth={1.5} aria-hidden />
            <h2 className="heading-classic mb-3 text-2xl">Real discussion</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              A commenting system tied to the database — visible to every
              visitor, backed by real accounts, no drive-by spam.
            </p>
          </div>
          <div>
            <span className="label-caps mb-5 block text-[13px] tracking-caps">01 — 03</span>
            <h2 className="heading-classic mb-3 text-2xl">Writing that scales</h2>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Descriptions support Notion-like blocks: paragraphs, headings,
              quotes, lists, bold and links. Structure for the words that
              deserve it.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line py-24 text-center">
        <p className="label-caps mb-6">Ready when you are</p>
        <h2 className="heading-classic mx-auto max-w-2xl text-4xl md:text-5xl">
          Start with a single image.
        </h2>
        <div className="mt-10 flex justify-center">
          <Link href="/register" className="btn-classic">
            Create an account
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
