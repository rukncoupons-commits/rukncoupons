import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { buildOrganizationSchema, SITE_URL } from "@/lib/seo-helpers";
import GeoSuggestionPopup from "@/components/GeoSuggestionPopup";
import WebVitalsLogger from "@/components/WebVitalsLogger";
import TrackingScripts from "@/components/TrackingScripts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ركن الكوبونات - أكواد خصم حصرية",
    template: "%s | ركن الكوبونات",
  },
  description: "أحدث عروض المتاجر وأكواد الخصم في السعودية، الإمارات، مصر، الكويت، قطر، البحرين وعُمان.",
  robots: { index: true, follow: true },
  twitter: {
    card: "summary_large_image",
    site: "@rukncoupons",
  },
  openGraph: {
    siteName: "ركن الكوبونات",
    locale: "ar_SA",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb", // blue-600
};

import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") || "ar";
  const isEn = locale === "en";
  return (
    <html lang={isEn ? "en" : "ar"} dir={isEn ? "ltr" : "rtl"}>
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        <link rel="manifest" href="/manifest.json" />
        <TrackingScripts />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased font-sans bg-gray-50`}>
        {/* Geo Auto Suggestion Layer */}
        <GeoSuggestionPopup />

        {/* Core Web Vitals RUM Logger */}
        <WebVitalsLogger />

        {/* Organization + WebSite Schema — Site-wide */}
        <Script
          id="org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationSchema()) }}
          strategy="afterInteractive"
        />
        {/* Legacy Heatmap Behavior Script for Blogs */}
        <Script src="/tracker.js" strategy="lazyOnload" />

        {/* Global Advanced Analytics Tracker */}
        <Script src="/metrics-tracker.js" strategy="lazyOnload" />
        {children}
      </body>
    </html>
  );
}
