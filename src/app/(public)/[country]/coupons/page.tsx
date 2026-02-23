import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import CouponCardServer from "@/components/CouponCardServer";
import { buildAbsoluteUrl, getCurrencyByCountry, buildHreflangAlternates } from "@/lib/seo-helpers";

// ISR: Regenerate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ store?: string; cat?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    const { currentCountry } = await getCountryData(country);
    if (!currentCountry) return { title: "الكوبونات - ركن الكوبونات" };
    return {
        title: `جميع كوبونات وعروض ${currentCountry.name} | ركن الكوبونات`,
        description: `تصفح أحدث الكوبونات والخصومات لجميع المتاجر في ${currentCountry.name}. عروض حصرية ومتجددة يومياً.`,
        alternates: {
            canonical: buildAbsoluteUrl(`/${country}/coupons`),
            languages: buildHreflangAlternates("/coupons"),
        },
        robots: "noindex, follow",
    };
}

export default async function CouponsPage({ params, searchParams }: PageProps) {
    const { country } = await params;
    const { store: storeParam, cat } = await searchParams;

    const [data, socialConfig] = await Promise.all([
        getCountryData(country),
        getSocialConfig(),
    ]);

    const currency = getCurrencyByCountry(country);
    const today = new Date().toISOString().split("T")[0];

    // Server-side filtering — no client JS needed at all
    let coupons = data.coupons.filter(c => !c.expiryDate || c.expiryDate >= today);
    if (storeParam) coupons = coupons.filter(c => c.storeId === storeParam);
    if (cat) coupons = coupons.filter(c => c.categories?.includes(cat));

    const storeMap = new Map(data.stores.map(s => [s.id, s]));
    const catMap = new Map(data.categories.map(c => [c.slug, c.name]));

    const jsonLd = coupons.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `كوبونات وعروض ${data.currentCountry?.name || ""}`,
        "numberOfItems": coupons.length,
        "itemListElement": coupons.slice(0, 20).map((c, i) => {
            const store = storeMap.get(c.storeId);
            return { "@type": "ListItem", "position": i + 1, "item": { "@type": "Offer", "name": c.title, "priceCurrency": currency, "offeredBy": store ? { "@type": "Store", "name": store.name } : undefined } };
        }),
    } : null;

    return (
        <main className="min-h-screen bg-gray-50 py-8 text-right" dir="rtl">
            {jsonLd && <Script id="coupons-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${country}`} className="hover:text-blue-600">الرئيسية</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">جميع الكوبونات</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <h1 className="text-3xl font-black text-gray-800 mb-4">جميع الكوبونات والعروض</h1>

                        {/* Filters — URL links, zero JS */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            {/* Store filter */}
                            <div className="mb-4">
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
                                    <Link
                                        href={`/${country}/coupons${cat ? `?cat=${cat}` : ""}`}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${!storeParam ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}
                                    >
                                        كل المتاجر
                                    </Link>
                                    {data.stores.slice(0, 15).map(s => (
                                        <Link
                                            key={s.id}
                                            href={`/${country}/coupons?store=${s.id}${cat ? `&cat=${cat}` : ""}`}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors flex items-center gap-1.5 ${storeParam === s.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}
                                            aria-label={`تصفية حسب متجر ${s.name}`}
                                        >
                                            <img src={s.logoUrl} alt="" className="w-4 h-4 rounded-full object-contain" loading="lazy" width={16} height={16} />
                                            <span aria-hidden="true">{s.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Category filter */}
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <Link
                                    href={`/${country}/coupons${storeParam ? `?store=${storeParam}` : ""}`}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${!cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                    الكل
                                </Link>
                                {data.categories.map(category => (
                                    <Link
                                        key={category.id}
                                        href={`/${country}/coupons?cat=${category.slug}${storeParam ? `&store=${storeParam}` : ""}`}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${cat === category.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                        aria-label={`تصفية حسب تصنيف ${category.name}`}
                                    >
                                        <span aria-hidden="true">{category.icon}</span>
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Results count */}
                        <p className="text-sm text-gray-500 mb-4 font-medium">{coupons.length} كوبون متاح</p>

                        {/* Coupon grid — fully server-rendered */}
                        {coupons.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {coupons.map((coupon) => (
                                    <CouponCardServer
                                        key={coupon.id}
                                        coupon={coupon}
                                        store={storeMap.get(coupon.storeId)}
                                        categoryName={catMap.get(storeMap.get(coupon.storeId)?.category || "") || undefined}
                                        countryCode={country}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-200">
                                <div className="text-5xl mb-4">🔍</div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج</h2>
                                <p className="text-gray-500 mb-6">جرب تغيير خيارات التصفية للعثور على عروض أكثر.</p>
                                <Link href={`/${country}/coupons`} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors inline-block">
                                    عرض جميع الكوبونات
                                </Link>
                            </div>
                        )}
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
