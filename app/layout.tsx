import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ChunkGuard from "@/components/layout/ChunkGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: true,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // allow pinch-zoom (accessibility) but prevent janky auto-zoom on input focus on iOS
  themeColor: "#0C0C0C",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://www.scarletimutt.my.id"),
  title: {
    default: "CloudMedia",
    template: "%s — CloudMedia",
  },
  description: "A media platform for images, video, and stories.",
  openGraph: {
    title: "CloudMedia",
    description: "A media platform for images, video, and stories.",
    images: [{ url: "/hero.jpg", width: 736, height: 414, alt: "CloudMedia" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudMedia",
    description: "A media platform for images, video, and stories.",
    images: ["/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-dvh bg-paper text-ink font-sans antialiased [-webkit-tap-highlight-color:transparent]">
      <ChunkGuard />
        {children}
      </body>
    </html>
  );
}
