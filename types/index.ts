export type RichBlock =
  | { type: "paragraph"; text: string; marks?: RichMark[] }
  | { type: "heading"; text: string; level: 2 | 3 }
  | { type: "quote"; text: string }
  | { type: "bullet"; text: string }
  | { type: "divider" };

export type RichMark =
  | { kind: "bold"; range: [number, number] }
  | { kind: "italic"; range: [number, number] }
  | { kind: "link"; range: [number, number]; href: string };

export type PostDTO = {
  id: string;
  title: string;
  description: RichBlock[] | null;
  type: "IMAGE";
  url: string;
  width: number | null;
  height: number | null;
  createdAt: string;
  author: { id: string; name: string | null; image: string | null; role?: "ADMIN" | "USER" };
  album: { id: string; title: string } | null;
  _count: { comments: number };
};
