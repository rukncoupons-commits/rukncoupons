import React from "react";
import Link from "next/link";
import Script from "next/script";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import CouponCardServer from "@/components/CouponCardServer";
import { getCurrencyByCountry } from "@/lib/seo-helpers";
import { getCountryName, Locale } from "@/lib/i18n";
import { getStoreName } from "@/lib/locale-content";
import { getCityContent, CityKey } from "@/lib/city-content";

interface CityPageProps {
    cityKey: CityKey;
    locale: string;
    country: string;
}

export default async function CityPage({ cityKey, locale, country }: CityPageProps) {
    const isEn = locale === "en";
    const dir = isEn ? "ltr" : "rtl";
    const cityData = getCityContent(cityKey, locale);

    // If a user navigates to a mismatched city/country (e.g. /ar/sa/dubai-coupons), render a localized 404
    if (!cityData || cityData.validCountryCode !== country) {
        return (
            <main className="min-h-screen bg-gray-50 py-20 flex items-center justify-center p-4">
                <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm max-w-lg w-full">
                    <div className="text-6xl mb-6">📍</div>
                    <h1 className="text-2xl font-black text-gray-800 mb-4">
                        {isEn ? "City Not Found in This Region" : "المدينة غير متوفرة في هذه المنطقة"}
                    </h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        {isEn
                            ? "It looks like the city pages you are looking for belong to a different country. Please navigate back to the regional homepage."
                            : "يبدو أن مدينة العروض التي تبحث عنها تابعة لدولة أخرى. يرجى العودة للصفحة الرئيسية للمنطقة لتصفح العروض."}
                    </p>
                    <Link href={`/${locale}/${country}`} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors inline-block w-full shadow-md">
                        {isEn ? "Return to Homepage" : "العودة للرئيسية"}
                    </Link>
                </div>
            </main>
        );
    }

    const countryName = getCountryName(locale as Locale, country);
    const currency = getCurrencyByCountry(country);

    const [data, socialConfig] = await Promise.all([
        getCountryData(country),
        getSocialConfig(),
    ]);

    // Active coupons in this country
    const now = new Date();
    const coupons = data.coupons.filter(c => !c.expiryDate || new Date(c.expiryDate) > now);
    const topCoupons = coupons.slice(0, 30); // Max 30 for performance / UX on landing page

    const storeMap = new Map(data.stores.map(s => [s.id, s]));
    const catMap = new Map(data.categories.map(c => [c.slug, c.name]));

    // Top stores for internal linking
    const topStores = data.stores.slice(0, 8);

    // ─── JSON-LD: ItemList ───────────────────────────────────────────────────
    const itemListSchema = topCoupons.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": cityData.h1,
        "numberOfItems": topCoupons.length,
        "itemListElement": topCoupons.slice(0, 20).map((c, i) => {
            const store = storeMap.get(c.storeId);
            return {
                "@type": "ListItem",
                "position": i + 1,
                "item": {
                    "@type": "Offer",
                    "name": c.title,
                    "priceCurrency": currency,
                    ...(store ? { "offeredBy": { "@type": "Store", "name": store.name } } : {}),
                },
            };
        }),
    } : null;

    // ─── JSON-LD: Breadcrumb ─────────────────────────────────────────────────
    // Note: Canonical URLs are handled by generateMetadata
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": isEn ? "Home" : "الرئيسية", "item": `https://rukncoupons.com/${locale}/${country}` },
            { "@type": "ListItem", "position": 2, "name": cityData.h1, "item": `https://rukncoupons.com/${locale}/${country}/${cityData.slug}` },
        ],
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8" dir={dir}>
            {/* Structured Data */}
            {itemListSchema && <Script id="itemlist-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />}
            <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="flex flex-wrap items-center mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${locale}/${country}`} className="hover:text-blue-600 transition-colors">{isEn ? "Home" : "الرئيسية"}</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">{cityData.h1}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        
                        {/* H1 & Intro */}
                        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-100">
                            <h1 className="text-3xl lg:text-4xl font-black text-gray-800 mb-6 leading-tight">
                                {cityData.h1}
                            </h1>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-sm lg:text-base">
                                <div dangerouslySetInnerHTML={{
                                    __html: cityData.intro.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                }} />
                            </div>
                        </div>

                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-blue-600">📍</span> 
                                {isEn ? `Latest Deals in ${cityData.name}` : `أحدث العروض في ${cityData.name}`}
                            </h2>
                            <p className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold shrink-0">
                                {topCoupons.length} {isEn ? "offers" : "عروض"}
                            </p>
                        </div>

                        {/* Coupon Grid */}
                        {topCoupons.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {topCoupons.map((coupon) => (
                                    <CouponCardServer
                                        key={coupon.id}
                                        coupon={coupon}
                                        store={storeMap.get(coupon.storeId)}
                                        categoryName={catMap.get(storeMap.get(coupon.storeId)?.category || "") || undefined}
                                        countryCode={country}
                                        locale={locale}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-200">
                                <div className="text-5xl mb-4">🔍</div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{isEn ? "No Results" : "لا توجد نتائج"}</h2>
                                <p className="text-gray-500 mb-6">{isEn ? "Check back soon for new offers." : "تحقق قريباً من العروض الجديدة."}</p>
                            </div>
                        )}

                        {/* ─── Internal Links: Top Stores ─────────────────────────── */}
                        <section className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                                🛍️ {isEn ? `Popular Stores in ${cityData.name}` : `المتاجر الشائعة في ${cityData.name}`}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {topStores.map(store => (
                                    <Link
                                        key={store.id}
                                        href={`/${locale}/${country}/${store.slug}`}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:shadow-md transition-all border border-transparent hover:border-blue-100 group text-center"
                                    >
                                        {store.logoUrl ? (
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center p-2 mb-3 border border-gray-100 group-hover:scale-105 transition-transform">
                                                <img src={store.logoUrl} alt="" className="w-full h-full object-contain" loading="lazy" width={32} height={32} />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded-full mb-3" />
                                        )}
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 line-clamp-1">{getStoreName(locale, store)}</span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* ─── Cross-links to other hubs ─────────────────── */}
                        <section className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black mb-4">
                                    {isEn ? "Want more savings?" : "ترغب في المزيد من التوفير؟"}
                                </h2>
                                <p className="text-blue-100 mb-6 text-sm leading-relaxed max-w-xl">
                                    {isEn 
                                        ? "Explore our curated hubs to find the absolute best daily drops and exclusive discounts that require no promotional codes at all." 
                                        : "اكتشف صفحاتنا المخصصة للعثور على أقوى التخفيضات اليومية والعروض الحصرية التي لا تحتاج إلى أي كود خصم إضافي."}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link href={`/${locale}/${country}/today-deals`} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2">
                                        🔥 {isEn ? "Today's Deals" : "عروض اليوم"}
                                    </Link>
                                    <Link href={`/${locale}/${country}/best-coupons`} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-full font-bold text-sm transition-colors flex items-center gap-2">
                                        ⭐ {isEn ? "Best Coupons" : "أفضل الكوبونات"}
                                    </Link>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                                <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.22-1.05-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 7 6.33 5.5 7z"/>
                                </svg>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
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
