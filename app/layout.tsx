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
  maximumScale: 5,
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

// Inline bootstrap error trap: runs BEFORE any React/chunk code, so it catches
// stale-chunk failures and hydration crashes that the error boundaries never see.
const errTrap = `window.__cm_err__=1;
window.addEventListener('error',function(e){try{var m=(e&&e.message)||'unknown';
fetch('/api/client-errors',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({message:String(m).slice(0,300),url:location.href})})['catch'](function(){})}catch(x){}});
window.addEventListener('unhandledrejection',function(e){try{
fetch('/api/client-errors',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({message:('REJ: '+String(e.reason)).slice(0,300),url:location.href})})['catch'](function(){})}catch(x){}});`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: errTrap }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink font-sans antialiased [-webkit-tap-highlight-color:transparent]">
        <ChunkGuard />
        {children}
      </body>
    </html>
  );
}
