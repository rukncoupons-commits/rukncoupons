import React from "react";
import { Metadata } from "next";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import StoresClient from "@/components/StoresClient";
import Script from "next/script";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";
import { isValidLocale, DEFAULT_LOCALE, t, getCountryName, type Locale } from "@/lib/i18n";
import { buildEnglishStoresTitle, buildEnglishStoresDescription } from "@/lib/seo-helpers-en";

// ISR: Regenerate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const locale = (isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE) as Locale;
    const { currentCountry } = await getCountryData(country);
    const isEn = locale === "en";

    if (!currentCountry) return { title: isEn ? "Stores - Rukn Coupons" : "المتاجر - ركن الكوبونات" };

    const title = isEn
        ? buildEnglishStoresTitle(country)
        : `جميع المتاجر في ${currentCountry.name} | ركن الكوبونات`;
    const description = isEn
        ? buildEnglishStoresDescription(country)
        : `قائمة كاملة بجميع المتاجر والعلامات التجارية المتوفرة في ${currentCountry.name}. استمتع بأحدث العروض والتخفيضات.`;
    const canonicalUrl = buildAbsoluteUrl(`/${locale}/${country}/stores`);

    return {
        title,
        description,
        openGraph: { title, description, url: canonicalUrl, type: "website" },
        alternates: {
            canonical: canonicalUrl,
            languages: {
                "ar": buildAbsoluteUrl(`/ar/${country}/stores`),
                "en": buildAbsoluteUrl(`/en/${country}/stores`),
                "x-default": buildAbsoluteUrl(`/ar/${country}/stores`),
            },
        },
        robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    };
}

export default async function StoresPage({ params }: PageProps) {
    const { locale: rawLocale, country } = await params;
    const locale = (isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE) as Locale;
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();
    const isEn = locale === "en";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": isEn ? `All Stores in ${getCountryName(locale, country)}` : `جميع المتاجر في ${data.currentCountry?.name || ""}`,
        "numberOfItems": data.stores.length,
        "itemListElement": data.stores.slice(0, 30).map((store, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
                "@type": "Store",
                "name": store.name,
                "image": store.logoUrl,
                "url": buildAbsoluteUrl(`/${locale}/${country}/${store.slug}`),
                "description": store.description,
            },
        })),
    };

    return (
        <>
            <Script
                id="stores-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <React.Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center p-10"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div></div>}>
                <StoresClient
                    initialStores={data.stores}
                    categories={data.categories}
                    allCoupons={data.coupons}
                    recentPosts={data.blogPosts.slice(0, 3)}
                    socialConfig={socialConfig}
                    adBanners={data.adBanners}
                    countryCode={country}
                    locale={locale}
                />
            </React.Suspense>
        </>
    );
}
