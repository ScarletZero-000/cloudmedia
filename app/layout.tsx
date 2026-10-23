import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

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
      <body className="bg-paper text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
