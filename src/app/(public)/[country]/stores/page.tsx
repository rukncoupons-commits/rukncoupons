import React from "react";
import { Metadata } from "next";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import StoresClient from "@/components/StoresClient";
import Script from "next/script";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";

// ISR: Regenerate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country } = await params;
    const { currentCountry } = await getCountryData(country);

    if (!currentCountry) return { title: "المتاجر - ركن الكوبونات" };

    const title = `جميع المتاجر في ${currentCountry.name} | ركن الكوبونات`;
    const description = `قائمة كاملة بجميع المتاجر والعلامات التجارية المتوفرة في ${currentCountry.name}. استمتع بأحدث العروض والتخفيضات.`;

    return {
        title,
        description,
        alternates: {
            canonical: buildAbsoluteUrl(`/${country}/stores`),
            languages: buildHreflangAlternates("/stores"),
        },
        // noindex on ?q= search results to avoid thin/duplicate pages
        robots: "index, follow",
    };
}

export default async function StoresPage({ params, searchParams }: PageProps) {
    const { country } = await params;
    const { q } = await searchParams;
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    // ItemList schema for stores directory
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `جميع المتاجر في ${data.currentCountry?.name || ""}`,
        "numberOfItems": data.stores.length,
        "itemListElement": data.stores.slice(0, 30).map((store, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
                "@type": "Store",
                "name": store.name,
                "image": store.logoUrl,
                "url": buildAbsoluteUrl(`/${country}/${store.slug}`),
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
            <StoresClient
                initialStores={data.stores}
                categories={data.categories}
                allCoupons={data.coupons}
                recentPosts={data.blogPosts.slice(0, 3)}
                socialConfig={socialConfig}
                adBanners={data.adBanners}
                countryCode={country}
                initialQuery={q}
            />
        </>
    );
}
