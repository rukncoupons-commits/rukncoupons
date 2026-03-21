import React from "react";
import { Metadata } from "next";
import { getCityContent, CityKey } from "@/lib/city-content";
import CityPage from "@/components/CityPage";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";
import { isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export const revalidate = 3600;

const CITY_KEY: CityKey = "dubai";

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
    const cityData = getCityContent(CITY_KEY, locale);

    if (!cityData) return { title: "Not Found" };

    const canonicalUrl = buildAbsoluteUrl(`/${locale}/${country}/${cityData.slug}`);

    return {
        title: cityData.title,
        description: cityData.description,
        openGraph: {
            title: cityData.title,
            description: cityData.description,
            url: canonicalUrl,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: cityData.title,
            description: cityData.description,
        },
        alternates: {
            canonical: canonicalUrl,
            languages: buildHreflangAlternates(`/${cityData.slug}`),
        },
        robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    };
}

export function generateStaticParams() {
    return []; // Generate on demand to prevent build-time hangs in CI
}

export default async function DubaiCouponsPage({ params }: PageProps) {
    const { locale: rawLocale, country } = await params;
    const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
    return <CityPage cityKey={CITY_KEY} locale={locale} country={country} />;
}
