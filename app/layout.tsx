import type { Metadata } from "next";
import { Geist, PT_Serif } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Toaster } from "sonner";
import TelegramProvider from "@/providers/TelegramProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Emamaye Daycare",
  description:
    "emamaye daycare management system is the least I can do for my amazing mom",
  icons: {
    icon: "/emamaye-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body
          className={`${geistSans.variable} ${ptSerif.variable} antialiased`}
        >
          <TelegramProvider />
          <Toaster />
          <ConvexClientProvider>{children}</ConvexClientProvider>

          {/* SVG Filters for Button Effects */}
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="0" width="0" style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id="turbulence" x="0%" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="turbulence" seed="2" stitchTiles="stitch" />
                <feColorMatrix in="turbulence" type="saturate" values="0" result="grayscaleNoise" />
                <feComponentTransfer>
                  <feFuncA type="table" tableValues="0 1" />
                </feComponentTransfer>
                <feBlend in="SourceGraphic" in2="grayscaleNoise" mode="soft-light" />
              </filter>
              <filter id="displacement">
                <feDisplacementMap in="SourceGraphic" scale="4" />
              </filter>
              <filter id="combined">
                <feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="4" />
                <feDisplacementMap in="SourceGraphic" scale="1" />
              </filter>
            </defs>
          </svg>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
