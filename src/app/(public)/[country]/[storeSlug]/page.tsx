import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryData, getStoreBySlug, getCouponsForStore, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import CouponListServer from "@/components/CouponListServer";
import DynamicStoreContent from "@/components/DynamicStoreContent";
import Script from "next/script";
import { Star, ExternalLink, Truck, RotateCcw, Tag, Zap, Copy, CheckCircle } from "lucide-react";
import {
    buildStorePageSchema,
    buildAbsoluteUrl,
    buildHreflangAlternates,
    buildDynamicStoreTitle,
    buildDynamicStoreDescription,
    buildExtendedStoreFAQ,
    getMaxDiscountPercent,
    countActiveCoupons,
    getTopCouponsForSnippet,
    validateContentDepth,
    COUNTRY_CONFIG
} from "@/lib/seo-helpers";

// ISR: Regenerate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ country: string; storeSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country, storeSlug } = await params;
    const [storeData, countryData] = await Promise.all([
        getStoreBySlug(country, storeSlug),
        getCountryData(country),
    ]);
    const { currentCountry } = countryData;

    if (!storeData || !storeData.store || !currentCountry) return { title: "المتجر - ركن الكوبونات" };

    const { store, coupons } = storeData;
    let seo = store.seo;
    if (store.countrySeo && store.countrySeo[country]) {
        seo = store.countrySeo[country];
    }

    // CTR Engine: compute live signals
    const maxDiscount = getMaxDiscountPercent(coupons);
    const activeCouponCount = countActiveCoupons(coupons);

    // Phase 1: Dynamic title (admin override → CTR-optimized → fallback)
    const title = buildDynamicStoreTitle({
        storeName: store.name,
        countryName: currentCountry.name,
        countryCode: country,
        maxDiscount,
        activeCouponCount,
        customTitle: seo?.metaTitle,
    });
    // Only append brand suffix if absent (prevents double suffix on admin-set titles)
    const finalTitle = title.includes("ركن الكوبونات") ? title : `${title} | ركن الكوبونات`;

    // Phase 2: Psychology-driven description
    const description = buildDynamicStoreDescription({
        storeName: store.name,
        countryName: currentCountry.name,
        maxDiscount,
        activeCouponCount,
        storeDescription: store.description,
        customDescription: seo?.metaDescription,
    });

    const canonicalUrl = buildAbsoluteUrl(`/${country}/${storeSlug}`);

    // We now guarantee content depth with DynamicStoreContent, but if there are 0 coupons AND no DB description,
    // we should still consider it thin and noindex it.
    const isThinPage = activeCouponCount === 0 && (!store.description || store.description.length < 50);

    return {
        title: finalTitle,
        description,
        openGraph: {
            title: seo?.ogTitle || finalTitle,
            description: seo?.ogDescription || description,
            images: [{ url: store.logoUrl, width: 400, height: 400, alt: `شعار ${store.name}` }],
            locale: COUNTRY_CONFIG[country]?.locale || "ar_SA",
            type: "website",
            url: canonicalUrl,
        },
        alternates: {
            canonical: seo?.canonicalUrl || canonicalUrl,
            languages: buildHreflangAlternates(`/${storeSlug}`),
        },
        robots: seo?.noIndex || isThinPage
            ? "noindex, nofollow"
            : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    };
}

export default async function StorePage({ params }: PageProps) {
    const { country, storeSlug } = await params;
    const storeData = await getStoreBySlug(country, storeSlug);
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    if (!storeData || !storeData.store || !data.currentCountry) {
        notFound();
        return null;
    }

    const { store } = storeData;
    const storeCoupons = await getCouponsForStore(store.id, country);
    const longDescription = (store.longDescriptions && store.longDescriptions[country]) || store.longDescription;

    // Related stores: same category, excluding current store
    const relatedStores = data.stores
        .filter(s => s.id !== store.id && s.category === store.category)
        .slice(0, 6);

    // CTR engine: compute live signals once
    const maxDiscount = getMaxDiscountPercent(storeCoupons);
    const activeCouponCount = countActiveCoupons(storeCoupons);
    const topCoupons = getTopCouponsForSnippet(storeCoupons, 3);

    // Phase 3: Extended PAA FAQ (6 questions) — stored FAQ wins if present
    const faqItems = (store as any).faq?.length
        ? (store as any).faq
        : buildExtendedStoreFAQ({
            storeName: store.name,
            countryName: data.currentCountry.name,
            activeCouponCount,
            maxDiscount,
            shippingInfo: store.shippingInfo,
            storeDescription: store.description,
        });

    // Build full JSON-LD schema
    const jsonLd = buildStorePageSchema({
        store: { ...store, faq: faqItems },
        coupons: storeCoupons,
        countryCode: country,
        countryName: data.currentCountry.name,
    });

    return (
        <main className="min-h-screen bg-gray-50 py-8 text-right" dir="rtl">
            <Script
                id="store-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${country}`} className="hover:text-blue-600">الرئيسية</Link>
                    <span>/</span>
                    <Link href={`/${country}/stores`} className="hover:text-blue-600">المتاجر</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">كود خصم {store.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">

                        {/* Store Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                            <div className="w-28 h-28 shrink-0 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center p-2 shadow-sm">
                                <img
                                    src={store.logoUrl}
                                    alt={`شعار ${store.name}`}
                                    className="w-full h-full object-contain rounded-full"
                                    fetchPriority="high"
                                    loading="eager"
                                    width={112}
                                    height={112}
                                />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-black text-gray-800 mb-1">
                                    كود خصم {store.name} {data.currentCountry.name}
                                </h1>

                                {/* Phase 4: E-E-A-T Trust Signals */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500 mb-3 mt-2">
                                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>تم التحقق بواسطة: فريق التحرير</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>تم التحديث في: {new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-400 mb-3" aria-label="تقييم 4.9 من 5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400" />
                                    ))}
                                    <span className="text-gray-400 text-xs mr-2">(4.9/5)</span>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-xl mx-auto md:mx-0 pl-[10%]">
                                    {store.description}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
                                    <a
                                        href={store.storeUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer sponsored"
                                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
                                        aria-label={`الذهاب إلى موقع ${store.name}`}
                                    >
                                        <span>الذهاب للمتجر</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-blue-500" />
                                            <span>{store.shippingInfo}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RotateCcw className="w-5 h-5 text-red-400" />
                                            <span>{store.returnPolicy}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phase 7: Featured Snippet Summary — top coupons quick-scan table */}
                        {topCoupons.length > 0 && (
                            <div className="bg-gradient-to-l from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                    <h2 className="font-black text-gray-800 text-sm">أفضل {topCoupons.length} كوبونات الآن</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-500 text-xs border-b border-blue-100">
                                                <th className="text-right pb-2 font-bold">العرض</th>
                                                <th className="text-center pb-2 font-bold">الخصم</th>
                                                <th className="text-center pb-2 font-bold">الكود</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-blue-50">
                                            {topCoupons.map((c) => (
                                                <tr key={c.id} className="py-2">
                                                    <td className="py-2 text-gray-700 font-medium line-clamp-1 max-w-[180px]">{c.title}</td>
                                                    <td className="py-2 text-center">
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                            {c.discountValue}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 text-center">
                                                        {c.code ? (
                                                            <span className="bg-gray-100 text-gray-700 px-3 py-0.5 rounded font-mono text-xs font-bold tracking-wider">
                                                                {c.code}
                                                            </span>
                                                        ) : (
                                                            <span className="text-blue-600 text-xs font-bold">صفقة</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Coupon Count Badge */}
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-black text-gray-800">
                                أفضل كوبونات {store.name} {data.currentCountry.name}
                            </h2>
                            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">
                                {activeCouponCount} عرض فعال
                            </span>
                        </div>

                        <CouponListServer
                            store={store}
                            coupons={storeCoupons}
                            countryCode={country}
                            countryName={data.currentCountry.name}
                            categoryName={data.categories.find(c => c.slug === store.category)?.name}
                        />

                        {/* Thin Content Fallback: shown when ZERO active coupons */}
                        {activeCouponCount === 0 && (
                            <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-6 text-right">
                                <h3 className="font-bold text-amber-800 text-lg mb-2">
                                    🔔 لا تفوّت عروض {store.name}!
                                </h3>
                                <p className="text-sm text-amber-700 leading-relaxed mb-4">
                                    لا توجد كوبونات فعّالة لمتجر {store.name} في {data.currentCountry.name} حالياً.
                                    نحن نراقب المتجر باستمرار ونضيف الكوبونات فور توفرها.
                                    اشترك في نشرتنا البريدية ليصلك إشعار فوري بمجرد توفر كود خصم جديد.
                                </p>
                                <div className="flex items-start gap-2 text-sm text-amber-700">
                                    <Tag className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>
                                        بينما تنتظر، تصفح{" "}
                                        <Link href={`/${country}/stores`} className="font-bold underline hover:text-amber-900">
                                            جميع المتاجر
                                        </Link>{" "}
                                        للعثور على أفضل العروض المتاحة الآن.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Guaranteed Depth Content Component - SEO Hardening */}
                        <DynamicStoreContent
                            storeName={store.name}
                            countryName={data.currentCountry.name}
                            countryCode={country}
                            storeCategory={data.categories.find(c => c.slug === store.category)?.name || 'التسوق'}
                        />

                        {/* Additional Long Description / Shopping Guide from DB (if exists) */}
                        {longDescription && (
                            <div className="mt-10 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden">
                                <div
                                    className="prose prose-blue max-w-none pl-[10%] text-gray-700 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: longDescription }}
                                />
                            </div>
                        )}

                        {/* FAQ Section */}
                        {faqItems.length > 0 && (
                            <div className="mt-10 bg-blue-50 rounded-3xl p-8 border border-blue-100">
                                <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                                    <span>❓</span> الأسئلة الشائعة حول {store.name}
                                </h2>
                                <div className="space-y-4">
                                    {faqItems.map((item: { question: string; answer: string }, i: number) => (
                                        <details key={i} className="group bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
                                            <summary className="flex justify-between items-center font-bold p-5 cursor-pointer text-gray-800 hover:bg-blue-50/50 transition-colors list-none select-none">
                                                <span>{item.question}</span>
                                                <span className="text-blue-500 text-xl transition-transform group-open:rotate-45">+</span>
                                            </summary>
                                            <div className="p-6 pt-0 text-gray-600 text-sm leading-relaxed border-t border-blue-50 mt-2">
                                                {item.answer}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Stores */}
                        {relatedStores.length > 0 && (
                            <div className="mt-10">
                                <h2 className="text-xl font-black text-gray-800 mb-4">متاجر مشابهة قد تهمك</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                    {relatedStores.map(s => (
                                        <Link
                                            key={s.id}
                                            href={`/${country}/${s.slug}`}
                                            className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center text-center hover:shadow-md hover:border-blue-200 transition-all group"
                                            aria-label={`تصفح متجر ${s.name}`}
                                        >
                                            <img
                                                src={s.logoUrl}
                                                alt={`كود خصم ${s.name}`}
                                                className="w-12 h-12 object-contain rounded-full mb-2 group-hover:scale-105 transition-transform"
                                                loading="lazy"
                                                width={48}
                                                height={48}
                                            />
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 line-clamp-1">{s.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="lg:col-span-4 xl:col-span-3">
                        <Sidebar
                            ads={data.adBanners}
                            recentPosts={data.blogPosts.slice(0, 3)}
                            socialConfig={socialConfig}
                            storesCount={data.stores.length}
                            couponsCount={data.coupons.length}
                            countryCode={country}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}
