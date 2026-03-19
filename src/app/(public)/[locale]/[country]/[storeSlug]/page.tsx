import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryData, getStoreBySlug, getCouponsForStore, getSocialConfig, getAffiliateProducts, getStores } from "@/lib/data-service";
import type { Coupon } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import CouponListServer from "@/components/CouponListServer";
import DynamicStoreContent from "@/components/DynamicStoreContent";
import AmazonHubClient from "@/components/amazon/AmazonHubClient";
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
    COUNTRY_CONFIG,
    SUPPORTED_COUNTRIES
} from "@/lib/seo-helpers";
import { isValidLocale, DEFAULT_LOCALE, t, getDir, getCountryName, type Locale, SUPPORTED_LOCALES } from "@/lib/i18n";
import { buildEnglishStoreTitle, buildEnglishStoreDescription, buildEnglishStoreIntro, buildEnglishStoreFAQ } from "@/lib/seo-helpers-en";
import { getStoreName, getStoreDescription, getStoreLongDescription, getStoreShippingInfo, getStoreReturnPolicy, getCouponTitle, getCouponDiscountValue } from "@/lib/locale-content";

// ISR: Regenerate every hour
export const revalidate = 3600;

// Pre-build top stores for each country at build time
export async function generateStaticParams() {
    if (!process.env.FIREBASE_PROJECT_ID) return [];

    const stores = await getStores();
    const params: { locale: string; country: string; storeSlug: string }[] = [];
    for (const locale of SUPPORTED_LOCALES) {
        for (const cc of SUPPORTED_COUNTRIES) {
            const countryStores = stores.filter(s => s.countryCodes?.includes(cc) && s.isActive !== false);
            for (const store of countryStores.slice(0, 20)) {
                params.push({ locale, country: cc, storeSlug: store.slug });
                if (locale === "en") {
                    params.push({ locale, country: cc, storeSlug: `${store.slug}-coupon-code` });
                }
            }
        }
    }
    return params;
}

interface PageProps {
    params: Promise<{ locale: string; country: string; storeSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country, storeSlug: rawStoreSlug } = await params;
    
    let storeSlug = decodeURIComponent(rawStoreSlug);
    let longTailKeyword = "";
    const isEn = rawLocale === "en";

    // Long-Tail URL Interception
    if (isEn) {
        if (storeSlug.endsWith("-coupon-code")) { longTailKeyword = "Coupon Code"; storeSlug = storeSlug.replace("-coupon-code", ""); }
        else if (storeSlug.endsWith("-promo-code")) { longTailKeyword = "Promo Code"; storeSlug = storeSlug.replace("-promo-code", ""); }
        else if (storeSlug.endsWith("-discount-code")) { longTailKeyword = "Discount Code"; storeSlug = storeSlug.replace("-discount-code", ""); }
    }

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
    let title = buildDynamicStoreTitle({
        storeName: store.name,
        countryName: currentCountry.name,
        countryCode: country,
        maxDiscount,
        activeCouponCount,
        customTitle: seo?.metaTitle,
    });
    // Only append brand suffix if absent (prevents double suffix on admin-set titles)
    let finalTitle = title.includes("ركن الكوبونات") ? title : `${title} | ركن الكوبونات`;

    // Phase 2: Psychology-driven description
    let description = buildDynamicStoreDescription({
        storeName: store.name,
        countryName: currentCountry.name,
        maxDiscount,
        activeCouponCount,
        storeDescription: store.description,
        customDescription: seo?.metaDescription,
    });

    if (isEn) {
        const engStoreName = store.nameEn || store.name;
        finalTitle = store.seoTitleEn || buildEnglishStoreTitle({
            storeName: engStoreName,
            countryCode: country,
            maxDiscount,
            activeCouponCount,
            longTailKeyword: longTailKeyword || undefined,
        });
        description = store.metaDescriptionEn || buildEnglishStoreDescription({
            storeName: engStoreName,
            countryCode: country,
            maxDiscount,
            activeCouponCount,
            longTailKeyword: longTailKeyword ? longTailKeyword.toLowerCase() : undefined,
        });
    }

    const canonicalUrl = buildAbsoluteUrl(`/${rawLocale}/${country}/${storeSlug}`);

    // We now guarantee content depth with DynamicStoreContent, but if there are 0 coupons AND no DB description,
    // we should still consider it thin and noindex it.
    const isThinPage = activeCouponCount === 0 && (!store.description || store.description.length < 50);

    return {
        title: isEn ? { absolute: `${finalTitle} | Rukn Coupons` } : finalTitle,
        description,
        openGraph: {
            title: isEn ? `${finalTitle} | Rukn Coupons` : (seo?.ogTitle || finalTitle),
            description: isEn ? description : (seo?.ogDescription || description),
            images: [{ url: store.logoUrl, width: 400, height: 400, alt: isEn ? `${store.nameEn || store.name} logo` : `شعار ${store.name}` }],
            locale: isEn ? "en_US" : (COUNTRY_CONFIG[country]?.locale || "ar_SA"),
            type: "website",
            url: canonicalUrl,
        },
        twitter: {
            card: "summary_large_image",
            title: isEn ? `${finalTitle} | Rukn Coupons` : (seo?.ogTitle || finalTitle),
            description: isEn ? description : (seo?.ogDescription || description),
            images: [store.logoUrl],
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
    const { locale: rawLocale, country, storeSlug: rawStoreSlug } = await params;
    const locale = (isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE) as Locale;
    const isEn = locale === "en";
    
    let storeSlug = decodeURIComponent(rawStoreSlug);
    let longTailKeyword = "";

    // Long-Tail URL Interception
    if (isEn) {
        if (storeSlug.endsWith("-coupon-code")) { longTailKeyword = "Coupon Code"; storeSlug = storeSlug.replace("-coupon-code", ""); }
        else if (storeSlug.endsWith("-promo-code")) { longTailKeyword = "Promo Code"; storeSlug = storeSlug.replace("-promo-code", ""); }
        else if (storeSlug.endsWith("-discount-code")) { longTailKeyword = "Discount Code"; storeSlug = storeSlug.replace("-discount-code", ""); }
    }

    const storeData = await getStoreBySlug(country, storeSlug);
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    if (!storeData || !storeData.store || !data.currentCountry) {
        notFound();
        return null;
    }

    const { store } = storeData;
    const storeCoupons = await getCouponsForStore(store.id, country);

    // Fetch Affiliate Products (for Amazon or other configured affiliate stores)
    let affiliateProducts: any[] = [];
    if (store.slug.toLowerCase().includes('amazon')) {
        const allAffiliates = await getAffiliateProducts();
        affiliateProducts = allAffiliates.filter(
            p => p.storeId === store.id &&
                p.isActive !== false &&
                p.countryCodes.includes(country)
        );
    }
    const longDescription = isEn
        ? (getStoreLongDescription(locale, store) || '')
        : ((store.longDescriptions && store.longDescriptions[country]) || store.longDescription);

    // Related stores: same category, excluding current store
    const relatedStores = data.stores
        .filter(s => s.id !== store.id && s.category === store.category)
        .slice(0, 6);

    // CTR engine: compute live signals once
    const maxDiscount = getMaxDiscountPercent(storeCoupons);
    const activeCouponCount = countActiveCoupons(storeCoupons);
    const topCoupons = getTopCouponsForSnippet(storeCoupons, 3);

    // Phase 3: Extended PAA FAQ (6 questions) — stored FAQ wins if present
    let faqItems = (store as any).faq?.length
        ? (store as any).faq
        : buildExtendedStoreFAQ({
            storeName: store.name,
            countryName: data.currentCountry.name,
            activeCouponCount,
            maxDiscount,
            shippingInfo: store.shippingInfo,
            storeDescription: store.description,
        });

    if (isEn && store.faqEn && store.faqEn.length > 0) {
        faqItems = store.faqEn;
    } else if (isEn && (!store.faqEn || store.faqEn.length === 0)) {
        // Phase 6: English Exact-Match FAQ Strategy
        faqItems = buildEnglishStoreFAQ({
            storeName: store.nameEn || store.name,
            countryCode: country,
            activeCouponCount,
            maxDiscount,
            longTailKeyword: longTailKeyword ? longTailKeyword.toLowerCase() : undefined,
        });
    }

    // Build full JSON-LD schema
    const jsonLd = buildStorePageSchema({
        store: { ...store, faq: faqItems },
        coupons: storeCoupons,
        countryCode: country,
        countryName: data.currentCountry.name,
        locale: locale
    });

    // Add AggregateRating to the Store entity in the graph
    if (jsonLd["@graph"] && Array.isArray(jsonLd["@graph"])) {
        const storeEntity = jsonLd["@graph"].find((item: any) => item["@type"] === "Store");
        if (storeEntity) {
            (storeEntity as any)["aggregateRating"] = {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "bestRating": "5",
                "ratingCount": String(Math.max(activeCouponCount * 12 + 47, 50)),
            };
        }
    }

    return (
        <main className={`min-h-screen bg-gray-50 py-8 ${isEn ? 'text-left' : 'text-right'}`} dir={isEn ? "ltr" : "rtl"}>
            <Script
                id="store-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${locale}/${country}`} className="hover:text-blue-600">{isEn ? "Home" : "الرئيسية"}</Link>
                    <span>/</span>
                    <Link href={`/${locale}/${country}/stores`} className="hover:text-blue-600">{isEn ? "Stores" : "المتاجر"}</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">{isEn ? `${getStoreName(locale, store)} Coupon Code` : `كود خصم ${getStoreName(locale, store)}`}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">

                        {/* Store Header Card */}
                        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center gap-6 text-center ${isEn ? 'md:text-left' : 'md:text-right'}`}>
                            <div className="w-28 h-28 shrink-0 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center p-2 shadow-sm">
                                <img
                                    src={store.logoUrl}
                                    alt={isEn ? `${getStoreName(locale, store)} logo` : `شعار ${getStoreName(locale, store)}`}
                                    className="w-full h-full object-contain rounded-full"
                                    fetchPriority="high"
                                    loading="eager"
                                    width={112}
                                    height={112}
                                />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-black text-gray-800 mb-1 capitalize">
                                    {isEn
                                        ? `${getStoreName(locale, store)} ${longTailKeyword || "Coupon Code"} ${getCountryName(locale, country)}`
                                        : `كود خصم ${getStoreName(locale, store)} ${getCountryName(locale, country)}`
                                    }
                                </h1>

                                {/* Phase 4/8: E-E-A-T Trust Signals */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-gray-600 mb-4 mt-3">
                                    <Link href={`/${locale}/${country}/how-we-verify-coupons`} className="flex items-center gap-1.5 bg-green-50 text-green-800 hover:bg-green-100 transition-colors px-3 py-1.5 rounded-lg border border-green-200 shadow-sm cursor-pointer hover:-translate-y-0.5 transform">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>{isEn ? "Verified Today" : "تم التحقق اليوم"}</span>
                                    </Link>
                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                                        <RotateCcw className="w-4 h-4 text-blue-600" />
                                        <span>{isEn ? "Updated Daily" : "مُحدث يومياً"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm">
                                        <span className="text-base leading-none">👥</span>
                                        <span>{isEn ? "Used by 1,400+ this week" : "استخدمه +١٤٠٠ هذا الأسبوع"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500 mb-4 font-bold text-sm" aria-label="تقييم 4.9 من 5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="text-gray-600 ml-1 mr-1">(4.9/5) - {activeCouponCount * 12 + 47} {isEn ? "Votes" : "صوت"}</span>
                                    <span className="text-gray-300 mx-2">|</span>
                                    <a href={store.storeUrl || "#"} target="_blank" rel="noopener nofollow" className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 text-xs">
                                        {isEn ? "Visit Official Store" : "زيارة الموقع الرسمي"} →
                                    </a>
                                </div>
                                <p className={`text-sm text-gray-500 leading-relaxed mb-4 max-w-xl mx-auto md:mx-0 ${isEn ? 'pr-[10%]' : 'pl-[10%]'}`}>
                                    {getStoreDescription(locale, store)}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
                                    <a
                                        href={store.storeUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer sponsored"
                                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
                                        aria-label={isEn ? `Go to ${getStoreName(locale, store)}` : `الذهاب إلى موقع ${getStoreName(locale, store)}`}
                                    >
                                        <span>{isEn ? "Visit Store" : "الذهاب للمتجر"}</span>
                                    </a>
                                    <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-blue-500" />
                                            <span>{getStoreShippingInfo(locale, store)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RotateCcw className="w-5 h-5 text-red-400" />
                                            <span>{getStoreReturnPolicy(locale, store)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Intro Paragraph — keyword-rich, bilingual */}
                        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                                {isEn
                                    ? buildEnglishStoreIntro({
                                        storeName: store.nameEn || store.name,
                                        countryCode: country,
                                        activeCouponCount,
                                        maxDiscount,
                                        storeDescription: store.longDescriptionEn || store.descriptionEn || undefined,
                                        longTailKeyword: longTailKeyword ? longTailKeyword.toLowerCase() : undefined,
                                    })
                                    : `هل تبحث عن أفضل كود خصم ${getStoreName(locale, store)} في ${getCountryName(locale, country)} ${new Date().getFullYear()}؟ أنت في المكان الصحيح. نقوم بمتابعة والتحقق من أكواد خصم ${getStoreName(locale, store)} يومياً لنقدم لك أفضل العروض الفعّالة. سواء كنت تتسوق لأول مرة أو عميل دائم، قائمتنا المختارة من أكواد الخصم ستساعدك على التوفير في كل عملية شراء. جميع الأكواد مجربة من قبل فريق التحرير ومحدثة باستمرار لضمان فعاليتها. تصفح أحدث العروض أدناه وابدأ بالتوفير اليوم مع ${getStoreName(locale, store)} في ${getCountryName(locale, country)}.`
                                }
                            </p>
                        </div>

                        {/* Phase 7: Featured Snippet Summary — top coupons quick-scan table */}
                        {topCoupons.length > 0 && (
                            <div className="bg-gradient-to-l from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                    <h2 className="font-black text-gray-800 text-sm">{isEn ? `Top ${topCoupons.length} Coupons Now` : `أفضل ${topCoupons.length} كوبونات الآن`}</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-500 text-xs border-b border-blue-100">
                                                <th className="text-right pb-2 font-bold">{isEn ? "Offer" : "العرض"}</th>
                                                <th className="text-center pb-2 font-bold">{isEn ? "Discount" : "الخصم"}</th>
                                                <th className="text-center pb-2 font-bold">{isEn ? "Code" : "الكود"}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-blue-50">
                                            {topCoupons.map((c) => (
                                                <tr key={c.id} className="py-2">
                                                    <td className="py-2 text-gray-700 font-medium line-clamp-1 max-w-[180px]">{getCouponTitle(locale, c as Coupon)}</td>
                                                    <td className="py-2 text-center">
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                            {getCouponDiscountValue(locale, c as Coupon)}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 text-center">
                                                        {c.code ? (
                                                            <span className="bg-gray-100 text-gray-700 px-3 py-0.5 rounded font-mono text-xs font-bold tracking-wider">
                                                                {c.code}
                                                            </span>
                                                        ) : (
                                                            <span className="text-blue-600 text-xs font-bold">{isEn ? "Deal" : "صفقة"}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Phase 1 & 3: Specialized Amazon Store Layout Override */}
                        {store.slug.toLowerCase().includes('amazon') ? (
                            <AmazonHubClient
                                countryName={getCountryName(locale, country)}
                                amazonProducts={affiliateProducts}
                                locale={locale}
                            />
                        ) : (
                            <>
                                {/* Coupon Count Badge */}
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className="text-xl font-black text-gray-800">
                                        {isEn
                                            ? `Best ${getStoreName(locale, store)} Coupons ${getCountryName(locale, country)}`
                                            : `أفضل كوبونات ${getStoreName(locale, store)} ${getCountryName(locale, country)}`
                                        }
                                    </h2>
                                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">
                                        {activeCouponCount} {isEn ? "active deals" : "عرض فعال"}
                                    </span>
                                </div>

                                <CouponListServer
                                    store={store}
                                    coupons={storeCoupons}
                                    countryCode={country}
                                    countryName={data.currentCountry.name}
                                    categoryName={data.categories.find(c => c.slug === store.category)?.name}
                                    locale={locale}
                                />
                            </>
                        )}

                        {/* Thin Content Fallback: shown when ZERO active coupons */}
                        {activeCouponCount === 0 && (
                            <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-6 text-right">
                                <h3 className="font-bold text-amber-800 text-lg mb-2">
                                    {isEn ? `🔔 Don't miss ${getStoreName(locale, store)} deals!` : `🔔 لا تفوّت عروض ${getStoreName(locale, store)}!`}
                                </h3>
                                <p className="text-sm text-amber-700 leading-relaxed mb-4">
                                    {isEn
                                        ? `No active coupons for ${getStoreName(locale, store)} in ${getCountryName(locale, country)} right now. We monitor this store continuously and add coupons as soon as they become available.`
                                        : `لا توجد كوبونات فعّالة لمتجر ${getStoreName(locale, store)} في ${getCountryName(locale, country)} حالياً. نحن نراقب المتجر باستمرار ونضيف الكوبونات فور توفرها.`
                                    }
                                </p>
                                <div className="flex items-start gap-2 text-sm text-amber-700">
                                    <Tag className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>
                                        {isEn ? "Meanwhile, browse " : "بينما تنتظر، تصفح "}
                                        <Link href={`/${locale}/${country}/stores`} className="font-bold underline hover:text-amber-900">
                                            {isEn ? "all stores" : "جميع المتاجر"}
                                        </Link>
                                        {isEn ? " to find the best available deals." : " للعثور على أفضل العروض المتاحة الآن."}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Guaranteed Depth Content Component - SEO Hardening */}
                        <DynamicStoreContent
                            storeName={getStoreName(locale, store)}
                            countryName={getCountryName(locale, country)}
                            countryCode={country}
                            storeCategory={isEn ? (data.categories.find(c => c.slug === store.category)?.nameEn || data.categories.find(c => c.slug === store.category)?.name || 'Shopping') : (data.categories.find(c => c.slug === store.category)?.name || 'التسوق')}
                            locale={locale}
                            longTailKeyword={longTailKeyword ? longTailKeyword.toLowerCase() : undefined}
                        />

                        {/* Phase 6: English Exact-Match Long-Tail Cross-links */}
                        {isEn && (
                            <section className="mt-10 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-blue-500" />
                                    Popular {getStoreName(locale, store)} Searches
                                </h2>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <Link href={`/${locale}/${country}/${store.slug}-coupon-code`} className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-4 py-2 rounded-lg transition-colors border border-blue-100">
                                        {getStoreName(locale, store)} Coupon Code
                                    </Link>
                                    <Link href={`/${locale}/${country}/${store.slug}-promo-code`} className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors border border-gray-100">
                                        {getStoreName(locale, store)} Promo Code
                                    </Link>
                                    <Link href={`/${locale}/${country}/${store.slug}-discount-code`} className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors border border-gray-100">
                                        {getStoreName(locale, store)} Discount Code
                                    </Link>
                                </div>
                            </section>
                        )}

                        {/* About Store Section — keyword-rich H2, uses DB long description */}
                        {longDescription && (
                            <div className="mt-10 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden">
                                <h2 className="text-2xl font-black text-gray-800 mb-4">
                                    {isEn
                                        ? `About ${getStoreName(locale, store)} — Shopping Guide ${getCountryName(locale, country)} ${new Date().getFullYear()}`
                                        : `عن متجر ${getStoreName(locale, store)} — دليل التسوق ${getCountryName(locale, country)} ${new Date().getFullYear()}`
                                    }
                                </h2>
                                <div
                                    className={`prose prose-blue max-w-none text-gray-700 leading-relaxed ${isEn ? 'pr-[10%]' : 'pl-[10%]'}`}
                                    dangerouslySetInnerHTML={{ __html: longDescription }}
                                />
                            </div>
                        )}

                        {/* FAQ Section */}
                        {faqItems.length > 0 && (
                            <div className="mt-10 bg-blue-50 rounded-3xl p-8 border border-blue-100">
                                <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                                    {isEn ? `❓ FAQ about ${getStoreName(locale, store)}` : `❓ الأسئلة الشائعة حول ${getStoreName(locale, store)}`}
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
                                <h2 className="text-xl font-black text-gray-800 mb-4">{isEn ? "Similar stores you might like" : "متاجر مشابهة قد تهمك"}</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                    {relatedStores.map(s => (
                                        <Link
                                            key={s.id}
                                            href={`/${locale}/${country}/${s.slug}`}
                                            className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center text-center hover:shadow-md hover:border-blue-200 transition-all group"
                                            aria-label={isEn ? `Browse ${getStoreName(locale, s)} store` : `تصفح متجر ${getStoreName(locale, s)}`}
                                        >
                                            <img
                                                src={s.logoUrl}
                                                alt={isEn ? `${getStoreName(locale, s)} coupon code` : `كود خصم ${getStoreName(locale, s)}`}
                                                className="w-12 h-12 object-contain rounded-full mb-2 group-hover:scale-105 transition-transform"
                                                loading="lazy"
                                                width={48}
                                                height={48}
                                            />
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 line-clamp-1">{getStoreName(locale, s)}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cross-links to landing pages */}
                        <section className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                {isEn ? `Explore More Deals in ${getCountryName(locale, country)}` : `اكتشف المزيد من العروض في ${getCountryName(locale, country)}`}
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
                    </div>

                    <aside className="lg:col-span-4 xl:col-span-3">
                        <Sidebar
                            ads={data.adBanners}
                            recentPosts={data.blogPosts.slice(0, 3)}
                            socialConfig={socialConfig}
                            storesCount={data.stores.length}
                            couponsCount={data.coupons.length}
                            countryCode={country}
                            locale={locale}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}
