import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import CouponCardServer from "@/components/CouponCardServer";
import HeroSliderClient from "@/components/HeroSliderClient";
import { buildAbsoluteUrl, buildBreadcrumbSchema, getCurrencyByCountry, buildHreflangAlternates, SUPPORTED_COUNTRIES } from "@/lib/seo-helpers";
import { isValidLocale, DEFAULT_LOCALE, t, getDir, getCountryName, type Locale, SUPPORTED_LOCALES } from "@/lib/i18n";
import { buildEnglishHomeTitle, buildEnglishHomeDescription } from "@/lib/seo-helpers-en";
import { getStoreName, getCategoryName as getLocCatName } from "@/lib/locale-content";

// ISR: Regenerate every hour
export const revalidate = 3600;

// Pre-build all locale+country homepages at build time
export function generateStaticParams() {
    if (!process.env.FIREBASE_PROJECT_ID) return [];

    const params: { locale: string; country: string }[] = [];
    for (const locale of SUPPORTED_LOCALES) {
        for (const country of SUPPORTED_COUNTRIES) {
            params.push({ locale, country });
        }
    }
    return params;
}

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; country: string }> }): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const locale = (isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE) as Locale;
    const { currentCountry } = await getCountryData(country);
    if (!currentCountry) return { title: t(locale, "siteName") };

    const isEn = locale === "en";
    const seo = currentCountry.seo;

    const title = isEn
        ? buildEnglishHomeTitle(country)
        : seo?.metaTitle || `كوبونات خصم ${currentCountry.name} - أحدث أكواد الخصم والعروض ${new Date().getFullYear()}`;
    const description = isEn
        ? buildEnglishHomeDescription(country)
        : seo?.metaDescription || `أفضل موقع للحصول على كود خصم نون، أمازون، شي إن، نمشي، والمزيد في ${currentCountry.name}. كوبونات حصرية ومحدثة يومياً.`;
    const canonicalUrl = buildAbsoluteUrl(`/${locale}/${country}`);

    return {
        title, description,
        openGraph: { title: seo?.ogTitle || title, description: seo?.ogDescription || description, url: canonicalUrl, type: "website" },
        twitter: {
            card: "summary_large_image",
            title: seo?.ogTitle || title,
            description: seo?.ogDescription || description,
        },
        alternates: {
            canonical: seo?.canonicalUrl || canonicalUrl,
            languages: {
                [`ar-${country.toUpperCase()}`]: buildAbsoluteUrl(`/ar/${country}`),
                [`en-${country.toUpperCase()}`]: buildAbsoluteUrl(`/en/${country}`),
                "x-default": buildAbsoluteUrl(`/ar/${country}`),
            },
        },
        robots: seo?.noIndex ? "noindex, nofollow" : { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    };
}

export default async function HomePage({ params }: PageProps) {
    const { locale: rawLocale, country } = await params;
    const locale = (isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE) as Locale;
    const isEn = locale === "en";
    const dir = getDir(locale);

    const [data, socialConfig] = await Promise.all([
        getCountryData(country),
        getSocialConfig(),
    ]);

    const currency = getCurrencyByCountry(country);

    // Server-side category filter
    const today = new Date().toISOString().split("T")[0];
    let displayCoupons = data.coupons
        .filter(c => !c.expiryDate || c.expiryDate >= today)
        .sort((a, b) => (a.isExclusive && !b.isExclusive ? -1 : !a.isExclusive && b.isExclusive ? 1 : 0));

    // No server-side category filtering on homepage to preserve 100% static CDN caching
    const selectedCat = undefined;
    const storeMap = new Map(data.stores.map(s => [s.id, s]));

    // Schema
    const breadcrumbLabel = isEn ? "Home" : "الرئيسية";
    const itemListLabel = isEn
        ? `Best Coupons & Deals in ${getCountryName(locale, country)}`
        : `أفضل كوبونات وعروض ${data.currentCountry?.name || ""}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            buildBreadcrumbSchema([{ name: breadcrumbLabel, url: `/${locale}/${country}` }]),
            displayCoupons.length > 0 ? {
                "@type": "ItemList",
                "name": itemListLabel,
                "numberOfItems": Math.min(displayCoupons.length, 10),
                "itemListElement": displayCoupons.slice(0, 10).map((c, i) => {
                    const store = storeMap.get(c.storeId);
                    return { "@type": "ListItem", "position": i + 1, "item": { "@type": "Offer", "name": c.title, "priceCurrency": currency, "offeredBy": store ? { "@type": "Store", "name": store.name } : undefined } };
                }),
            } : null,
            {
                "@type": "Organization",
                "name": isEn ? "Rukn Coupons" : "ركن الكوبونات",
                "url": `https://rukncoupons.com/${locale}/${country}`,
                "logo": "https://rukncoupons.com/icon.png",
                "sameAs": [
                    socialConfig.facebook,
                    socialConfig.twitter,
                    socialConfig.instagram,
                    socialConfig.tiktok,
                    socialConfig.youtube,
                    socialConfig.snapchat
                ].filter(Boolean)
            },
            {
                "@type": "WebSite",
                "name": isEn ? "Rukn Coupons" : "ركن الكوبونات",
                "url": `https://rukncoupons.com/${locale}/${country}`,
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `https://rukncoupons.com/${locale}/${country}/stores?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            }
        ].filter(Boolean),
    };

    return (
        <main className={`min-h-screen pb-12 bg-gray-50 ${isEn ? "text-left" : "text-right"}`} dir={dir}>
            <Script id="home-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="container mx-auto py-6 space-y-10 px-4">

                {/* SLIDER */}
                {data.slides.length > 0 && (
                    <HeroSliderClient slides={data.slides} isEn={isEn} />
                )}

                {/* FEATURED STORES */}
                <section aria-labelledby="stores-heading">
                    <div className="flex justify-between items-center mb-4">
                        <h3 id="stores-heading" className="text-xl font-black text-gray-800">{t(locale, "popularStores")}</h3>
                        <Link href={`/${locale}/${country}/stores`} prefetch={false} className="text-xs font-bold text-blue-600 hover:underline">{t(locale, "viewAll")}</Link>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                        {data.stores.slice(0, 12).map((store) => (
                            <Link
                                key={store.id}
                                href={`/${locale}/${country}/${store.slug}`}
                                prefetch={false}
                                className="flex flex-col items-center gap-2 min-w-[72px] group"
                                aria-label={isEn ? `Store: ${getStoreName(locale, store)}` : `متجر ${getStoreName(locale, store)}`}
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                                    <img
                                        src={store.logoUrl}
                                        alt={isEn ? `${getStoreName(locale, store)} coupon code` : `كود خصم ${getStoreName(locale, store)}`}
                                        className="w-full h-full object-contain rounded-full"
                                        loading="lazy"
                                        width={64}
                                        height={64}
                                    />
                                </div>
                                <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 text-center line-clamp-1 max-w-[72px]">
                                    {getStoreName(locale, store)}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* CATEGORY FILTER */}
                <section aria-label={t(locale, "filterByCategory")}>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <Link
                            href={`/${locale}/${country}`}
                            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors bg-blue-600 text-white`}
                        >
                            {t(locale, "all")}
                        </Link>
                        {data.categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/${locale}/${country}/coupons?cat=${category.slug}`}
                                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200`}
                            >
                                {category.icon && <span aria-hidden="true">{category.icon}</span>}
                                {getLocCatName(locale, category)}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* MAIN GRID + SIDEBAR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6 border-t border-gray-200">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            {t(locale, "latestCoupons")}
                            {selectedCat && (
                                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {selectedCat ? getLocCatName(locale, selectedCat) : ""}
                                </span>
                            )}
                        </h1>

                        {displayCoupons.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {displayCoupons.slice(0, 20).map((coupon) => (
                                    <CouponCardServer
                                        key={coupon.id}
                                        coupon={coupon}
                                        store={storeMap.get(coupon.storeId)}
                                        categoryName={data.categories.find(c => c.id === coupon.storeId)?.name}
                                        countryCode={country}
                                        locale={locale}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-200">
                                <div className="text-5xl mb-4">😔</div>
                                <p className="text-gray-500">{t(locale, "noCouponsInCategory")}</p>
                                <Link href={`/${locale}/${country}`} className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                                    {t(locale, "viewAllCoupons")}
                                </Link>
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <Link
                                href={`/${locale}/${country}/coupons`}
                                className="inline-flex items-center gap-2 bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-bold py-4 px-10 rounded-2xl shadow-sm hover:shadow-md transition-all"
                            >
                                <span>{t(locale, "viewAllCoupons")}</span>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                        </div>

                        {/* LANDING PAGE CROSS-LINKS */}
                        <section className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                {isEn ? `Explore Deals in ${getCountryName(locale, country)}` : `اكتشف العروض في ${getCountryName(locale, country)}`}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Link href={`/${locale}/${country}/best-coupons`} className="bg-white rounded-xl p-3 text-center hover:shadow-md transition-shadow font-bold text-sm text-gray-700 hover:text-blue-600">
                                    ⭐ {isEn ? "Best Coupons" : "أفضل الكوبونات"}
                                </Link>
                                <Link href={`/${locale}/${country}/today-deals`} className="bg-white rounded-xl p-3 text-center hover:shadow-md transition-shadow font-bold text-sm text-gray-700 hover:text-blue-600">
                                    🔥 {isEn ? "Today's Deals" : "عروض اليوم"}
                                </Link>
                                <Link href={`/${locale}/${country}/new-coupons`} className="bg-white rounded-xl p-3 text-center hover:shadow-md transition-shadow font-bold text-sm text-gray-700 hover:text-blue-600">
                                    ✨ {isEn ? "New Coupons" : "كوبونات جديدة"}
                                </Link>
                                <Link href={`/${locale}/${country}/no-code-needed`} className="bg-white rounded-xl p-3 text-center hover:shadow-md transition-shadow font-bold text-sm text-gray-700 hover:text-blue-600">
                                    🎯 {isEn ? "No Code Needed" : "عروض بدون كود"}
                                </Link>
                            </div>
                        </section>

                        {/* POPULAR STORES — Keyword-Rich Anchor Text Grid */}
                        <section className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                {isEn ? `🛍️ Top Store Coupons in ${getCountryName(locale, country)}` : `🛍️ أفضل كوبونات المتاجر في ${getCountryName(locale, country)}`}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {data.stores.slice(0, 12).map(store => (
                                    <Link
                                        key={store.id}
                                        href={`/${locale}/${country}/${store.slug}`}
                                        className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium text-gray-700"
                                    >
                                        <img src={store.logoUrl} alt="" className="w-7 h-7 rounded-full object-contain bg-white border border-gray-100" loading="lazy" width={28} height={28} />
                                        <span>{isEn ? `${getStoreName(locale, store)} coupon code` : `كود خصم ${getStoreName(locale, store)}`}</span>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <Link href={`/${locale}/${country}/stores`} className="text-blue-600 font-bold text-sm hover:underline">
                                    {isEn ? "View All Stores →" : "عرض جميع المتاجر ←"}
                                </Link>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4 xl:col-span-3">
                        <Sidebar
                            ads={data.adBanners}
                            recentPosts={data.blogPosts.slice(0, 3)}
                            socialConfig={socialConfig}
                            storesCount={data.stores.length}
                            couponsCount={data.coupons.length}
                            countryCode={country}
                            locale={locale}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
