import type { Metadata } from "next";
import { Geist_Mono, Inter, Oswald } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TAGLINE } from "@/lib/catalog";
import "./globals.css";
import "./tokens.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  title: {
    default: `RAPPI SPORTS HUB · ${TAGLINE}`,
    template: "%s · RAPPI SPORTS HUB",
  },
  description:
    "RAPPI SPORTS HUB — consumer sports catalog. Equip. Perform. Inspire.",
  icons: {
    icon: "/brand/rappi-logo.png",
    apple: "/brand/rappi-logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <Providers>
          <Suspense fallback={null}>
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
