import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getCountryData, getTrackingConfig, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import CouponCardServer from "@/components/CouponCardServer";
import { buildAbsoluteUrl, buildBreadcrumbSchema, getCurrencyByCountry, buildHreflangAlternates } from "@/lib/seo-helpers";

// ISR: Regenerate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ cat?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    const { currentCountry } = await getCountryData(country);
    if (!currentCountry) return { title: "ركن الكوبونات" };

    const seo = currentCountry.seo;
    const title = seo?.metaTitle || `كوبونات خصم ${currentCountry.name} - أحدث أكواد الخصم والعروض 2026`;
    const description = seo?.metaDescription || `أفضل موقع للحصول على كود خصم نون، أمازون، شي إن، نمشي، والمزيد في ${currentCountry.name}. كوبونات حصرية ومحدثة يومياً.`;
    const canonicalUrl = buildAbsoluteUrl(`/${country}`);

    return {
        title, description,
        openGraph: { title: seo?.ogTitle || title, description: seo?.ogDescription || description, url: canonicalUrl, type: "website" },
        alternates: {
            canonical: seo?.canonicalUrl || canonicalUrl,
            languages: buildHreflangAlternates(""),
        },
        robots: seo?.noIndex ? "noindex, nofollow" : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    };
}

export default async function HomePage({ params, searchParams }: PageProps) {
    const { country } = await params;
    const { cat } = await searchParams;

    const [data, socialConfig] = await Promise.all([
        getCountryData(country),
        getSocialConfig(),
    ]);

    const currency = getCurrencyByCountry(country);

    // Server-side category filter — no client JS needed
    const today = new Date().toISOString().split("T")[0];
    let displayCoupons = data.coupons
        .filter(c => !c.expiryDate || c.expiryDate >= today)
        .sort((a, b) => (a.isExclusive && !b.isExclusive ? -1 : !a.isExclusive && b.isExclusive ? 1 : 0));

    if (cat) {
        displayCoupons = displayCoupons.filter(c => c.categories?.includes(cat));
    }

    const selectedCat = data.categories.find(c => c.slug === cat);
    const storeMap = new Map(data.stores.map(s => [s.id, s]));

    // Schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            buildBreadcrumbSchema([{ name: "الرئيسية", url: `/${country}` }]),
            displayCoupons.length > 0 ? {
                "@type": "ItemList",
                "name": `أفضل كوبونات وعروض ${data.currentCountry?.name || ""}`,
                "numberOfItems": Math.min(displayCoupons.length, 10),
                "itemListElement": displayCoupons.slice(0, 10).map((c, i) => {
                    const store = storeMap.get(c.storeId);
                    return { "@type": "ListItem", "position": i + 1, "item": { "@type": "Offer", "name": c.title, "priceCurrency": currency, "offeredBy": store ? { "@type": "Store", "name": store.name } : undefined } };
                }),
            } : null,
        ].filter(Boolean),
    };

    return (
        <main className="min-h-screen pb-12 bg-gray-50 text-right" dir="rtl">
            <Script id="home-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="container mx-auto py-6 space-y-10 px-4">

                {/* SLIDER — CSS scroll-snap, zero JS */}
                {data.slides.length > 0 && (
                    <section aria-label="عروض مميزة" className="w-full rounded-3xl overflow-hidden shadow-lg">
                        <div
                            className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                            style={{ scrollBehavior: "smooth" }}
                        >
                            {data.slides.map((slide) => (
                                <a
                                    key={slide.id}
                                    href={slide.linkUrl || "#"}
                                    className="flex-shrink-0 w-full snap-start relative h-[200px] md:h-[320px] block"
                                    style={{ minWidth: "100%" }}
                                >
                                    <img
                                        src={slide.image}
                                        className="w-full h-full object-cover"
                                        alt={slide.title || "عرض مميز"}
                                        loading="eager"
                                        fetchPriority="high"
                                        decoding="async"
                                        width={1200}
                                        height={400}
                                    />
                                    {slide.title && (
                                        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
                                            <h2 className="text-xl md:text-3xl font-black mb-2 leading-tight">{slide.title}</h2>
                                            {slide.description && <p className="text-sm text-gray-200 line-clamp-1">{slide.description}</p>}
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {/* FEATURED STORES — static links grid */}
                <section aria-labelledby="stores-heading">
                    <div className="flex justify-between items-center mb-4">
                        <h3 id="stores-heading" className="text-xl font-black text-gray-800">🛍️ المتاجر الشائعة</h3>
                        <Link href={`/${country}/stores`} prefetch={false} className="text-xs font-bold text-blue-600 hover:underline">عرض الكل</Link>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                        {data.stores.slice(0, 12).map((store) => (
                            <Link
                                key={store.id}
                                href={`/${country}/${store.slug}`}
                                prefetch={false}
                                className="flex flex-col items-center gap-2 min-w-[72px] group"
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                                    <img
                                        src={store.logoUrl}
                                        alt={`كود خصم ${store.name}`}
                                        className="w-full h-full object-contain rounded-full"
                                        loading="lazy"
                                        width={64}
                                        height={64}
                                    />
                                </div>
                                <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 text-center line-clamp-1 max-w-[72px]">
                                    {store.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* CATEGORY FILTER — server-driven URL links, zero JS */}
                <section aria-label="تصفح حسب التصنيف">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <Link
                            href={`/${country}`}
                            className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${!cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            الكل
                        </Link>
                        {data.categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/${country}?cat=${category.slug}`}
                                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors ${cat === category.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                <span aria-hidden="true">{category.icon}</span>
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* MAIN GRID + SIDEBAR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6 border-t border-gray-200">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            أحدث الكوبونات
                            {selectedCat && (
                                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {selectedCat.name}
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
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-200">
                                <div className="text-5xl mb-4">😔</div>
                                <p className="text-gray-500">لا توجد كوبونات في هذا التصنيف.</p>
                                <Link href={`/${country}`} className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                                    عرض جميع الكوبونات
                                </Link>
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <Link
                                href={`/${country}/coupons`}
                                className="inline-flex items-center gap-2 bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-bold py-4 px-10 rounded-2xl shadow-sm hover:shadow-md transition-all"
                            >
                                <span>عرض جميع الكوبونات</span>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-4 xl:col-span-3">
                        <Sidebar
                            ads={data.adBanners}
                            recentPosts={data.blogPosts.slice(0, 3)}
                            socialConfig={socialConfig}
                            storesCount={data.stores.length}
                            couponsCount={data.coupons.length}
                            countryCode={country}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
