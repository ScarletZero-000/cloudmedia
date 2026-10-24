import type { RichBlock, RichMark } from "@/types";
// Normalize: description may be a string (legacy) or blocks array — never crash on .map.
function asSafeBlocks(v: unknown): RichBlock[] {
  if (Array.isArray(v)) return v as RichBlock[];
  if (typeof v === "string" && v.trim()) return [{ type: "paragraph", text: v }] as unknown as RichBlock[];
  return [];
}


/**
 * Renders Notion-like blocks server-side.
 * Marks are inline (bold/italic/link) applied by character ranges, Notion-style.
 */
function applyMarks(text: string, marks?: RichMark[]) {
  if (!marks?.length) return text;
  // Build segments sorted by start; simple flat renderer (non-overlapping ranges)
  const sorted = [...marks].sort((a, b) => a.range[0] - b.range[0]);
  const out: React.ReactNode[] = [];
  let pos = 0;
  sorted.forEach((m, i) => {
    const [s, e] = m.range;
    if (s > pos) out.push(text.slice(pos, s));
    const seg = text.slice(s, e);
    if (m.kind === "bold") out.push(<strong key={i}>{seg}</strong>);
    else if (m.kind === "italic") out.push(<em key={i}>{seg}</em>);
    else if (m.kind === "link")
      out.push(
        <a key={i} href={m.href} className="underline underline-offset-2 hover:text-ink-soft" rel="noreferrer noopener" target="_blank">
          {seg}
        </a>
      );
    pos = e;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}

export default function RichText({ blocks }: { blocks: RichBlock[] | null }) {
  const safe = asSafeBlocks(blocks);
  if (!safe.length) return null;
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">
      {safe.map((b, i) => {
        switch (b.type) {
          case "heading":
            return b.level === 2 ? (
              <h2 key={i} className="heading-classic pt-3 text-xl text-ink">{b.text}</h2>
            ) : (
              <h3 key={i} className="heading-classic pt-2 text-lg text-ink">{b.text}</h3>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-l-2 border-ink pl-4 font-serif italic text-ink">
                {applyMarks(b.text)}
              </blockquote>
            );
          case "bullet":
            return (
              <div key={i} className="flex gap-3">
                <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink" />
                <p>{applyMarks(b.text)}</p>
              </div>
            );
          case "divider":
            return <hr key={i} className="border-line" />;
          default:
            return <p key={i}>{applyMarks(b.text, b.marks)}</p>;
        }
      })}
    </div>
  );
}
