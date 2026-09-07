import type { Metadata } from "next";
import { Geist_Mono, Inter, Oswald } from "next/font/google";
import { BrandAtmosphere } from "@/components/brand-atmosphere";
import { Providers } from "@/components/providers";
import { StorefrontChrome } from "@/components/storefront-chrome";
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
    "RAPPI SPORTS HUB — consumer sports catalog. Gear up. Show up. Level up.",
  applicationName: "RAPPI SPORTS HUB",
  openGraph: {
    title: "RAPPI SPORTS HUB",
    description: TAGLINE,
    siteName: "RAPPI SPORTS HUB",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <BrandAtmosphere />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <Providers>
            <StorefrontChrome>{children}</StorefrontChrome>
          </Providers>
        </div>
      </body>
    </html>
  );
}
