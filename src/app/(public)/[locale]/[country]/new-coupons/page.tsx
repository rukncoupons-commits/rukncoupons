import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import CouponCardServer from "@/components/CouponCardServer";
import { buildAbsoluteUrl, buildHreflangAlternates, getCurrencyByCountry } from "@/lib/seo-helpers";
import { isValidLocale, DEFAULT_LOCALE, getCountryName, type Locale } from "@/lib/i18n";
import { getLandingPageBySlug } from "@/lib/landing-page-content";
import { getStoreName } from "@/lib/locale-content";

export const revalidate = 3600;

const PAGE_SLUG = "new-coupons";

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
    const pageDef = getLandingPageBySlug(PAGE_SLUG)!;
    const countryName = getCountryName(locale, country);
    const year = new Date().getFullYear();

    const title = pageDef.seo[locale].title(countryName, year);
    const description = pageDef.seo[locale].description(countryName);
    const canonicalUrl = buildAbsoluteUrl(`/${locale}/${country}/${PAGE_SLUG}`);

    return {
        title,
        description,
        openGraph: { title, description, url: canonicalUrl, type: "website", siteName: locale === "en" ? "Rukn Coupons" : "ركن الكوبونات" },
        twitter: { card: "summary_large_image", title, description },
        alternates: { canonical: canonicalUrl, languages: buildHreflangAlternates(`/${PAGE_SLUG}`) },
        robots: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    };
}

export default async function NewCouponsPage({ params }: PageProps) {
    const { locale: rawLocale, country } = await params;
    const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
    const isEn = locale === "en";
    const dir = isEn ? "ltr" : "rtl";
    const pageDef = getLandingPageBySlug(PAGE_SLUG)!;
    const countryName = getCountryName(locale, country);
    const currency = getCurrencyByCountry(country);

    const [data, socialConfig] = await Promise.all([getCountryData(country), getSocialConfig()]);
    const coupons = pageDef.filter(data.coupons);
    const storeMap = new Map(data.stores.map(s => [s.id, s]));
    const catMap = new Map(data.categories.map(c => [c.slug, c.name]));
    const topStores = data.stores.slice(0, 8);

    const itemListSchema = coupons.length > 0 ? {
        "@context": "https://schema.org", "@type": "ItemList",
        "name": pageDef.content[locale].h1(countryName), "numberOfItems": coupons.length,
        "itemListElement": coupons.slice(0, 20).map((c, i) => {
            const store = storeMap.get(c.storeId);
            return { "@type": "ListItem", "position": i + 1, "item": { "@type": "Offer", "name": c.title, "priceCurrency": currency, ...(store ? { "offeredBy": { "@type": "Store", "name": store.name } } : {}) } };
        }),
    } : null;

    const faqSchema = {
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": pageDef.faqs[locale].map(faq => ({ "@type": "Question", "name": faq.question, "acceptedAnswer": { "@type": "Answer", "text": faq.answer } })),
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": isEn ? "Home" : "الرئيسية", "item": buildAbsoluteUrl(`/${locale}/${country}`) },
            { "@type": "ListItem", "position": 2, "name": pageDef.content[locale].h1(countryName) },
        ],
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8" dir={dir}>
            {itemListSchema && <Script id="itemlist-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />}
            <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <div className="container mx-auto px-4">
                <nav aria-label="breadcrumb" className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${locale}/${country}`} className="hover:text-blue-600">{isEn ? "Home" : "الرئيسية"}</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">{pageDef.content[locale].h1(countryName)}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <h1 className="text-3xl font-black text-gray-800 mb-4">{pageDef.content[locale].h1(countryName)}</h1>
                        <p className="text-gray-600 leading-relaxed mb-6 text-sm">{pageDef.content[locale].intro(countryName)}</p>
                        <p className="text-sm text-gray-500 mb-4 font-medium">{coupons.length} {isEn ? "coupons available" : "كوبون متاح"}</p>

                        {coupons.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {coupons.map((coupon) => (
                                    <CouponCardServer key={coupon.id} coupon={coupon} store={storeMap.get(coupon.storeId)} categoryName={catMap.get(storeMap.get(coupon.storeId)?.category || "") || undefined} countryCode={country} locale={locale} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-200">
                                <div className="text-5xl mb-4">🔍</div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{isEn ? "No Results" : "لا توجد نتائج"}</h2>
                                <p className="text-gray-500 mb-6">{isEn ? "Check back soon for new coupons." : "تحقق قريباً من الكوبونات الجديدة."}</p>
                                <Link href={`/${locale}/${country}`} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors inline-block">{isEn ? "Browse All Stores" : "تصفح جميع المتاجر"}</Link>
                            </div>
                        )}

                        <section className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">{isEn ? `🛍️ Popular Stores in ${countryName}` : `🛍️ المتاجر الشائعة في ${countryName}`}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {topStores.map(store => (
                                    <Link key={store.id} href={`/${locale}/${country}/${store.slug}`} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium text-gray-700">
                                        {store.logoUrl && <img src={store.logoUrl} alt="" className="w-6 h-6 rounded-full object-contain" loading="lazy" width={24} height={24} />}
                                        <span>{getStoreName(locale, store)}</span>
                                    </Link>
                                ))}
                            </div>
                            <Link href={`/${locale}/${country}`} className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-bold text-sm">{isEn ? "View all stores →" : "عرض جميع المتاجر ←"}</Link>
                        </section>

                        <section className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">{isEn ? "Frequently Asked Questions" : "الأسئلة الشائعة"}</h2>
                            <div className="space-y-4">
                                {pageDef.faqs[locale].map((faq, idx) => (
                                    <details key={idx} className="group border border-gray-100 rounded-xl overflow-hidden">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-blue-50 transition-colors font-bold text-gray-800 text-sm">
                                            <span>{faq.question}</span>
                                            <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </summary>
                                        <div className="p-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">{faq.answer}</div>
                                    </details>
                                ))}
                            </div>
                        </section>

                        <section className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">{isEn ? "Explore More Deals" : "اكتشف المزيد من العروض"}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Link href={`/${locale}/${country}/best-coupons`} className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow font-bold text-sm text-gray-700 hover:text-blue-600">⭐ {isEn ? "Best Coupons" : "أفضل الكوبونات"}</Link>
                                <Link href={`/${locale}/${country}/today-deals`} className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow font-bold text-sm text-gray-700 hover:text-blue-600">🔥 {isEn ? "Today's Deals" : "عروض اليوم"}</Link>
                                <Link href={`/${locale}/${country}/no-code-needed`} className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow font-bold text-sm text-gray-700 hover:text-blue-600">🎯 {isEn ? "No Code Needed" : "عروض بدون كود"}</Link>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4 xl:col-span-3">
                        <Sidebar ads={data.adBanners} recentPosts={data.blogPosts.slice(0, 3)} socialConfig={socialConfig} storesCount={data.stores.length} couponsCount={data.coupons.length} countryCode={country} locale={locale} />
                    </div>
                </div>
            </div>
        </main>
    );
}
