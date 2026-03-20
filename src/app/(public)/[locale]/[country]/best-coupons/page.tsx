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

const PAGE_SLUG = "best-coupons";

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

    // --- SAUDI SEO OVERRIDE ---
    if (locale === "ar" && country === "sa") {
        const title = "أفضل كود خصم في السعودية 2026 (خصومات حتى 70% + عروض يومية)";
        const description = "احصل على أفضل كوبونات السعودية مع خصومات حصرية محدثة يوميًا على أشهر المتاجر.";
        const canonicalUrl = buildAbsoluteUrl(`/ar/sa/best-coupons`);

        return {
            title,
            description,
            openGraph: { title, description, url: canonicalUrl, type: "website", siteName: "ركن الكوبونات" },
            twitter: { card: "summary_large_image", title, description },
            alternates: {
                canonical: canonicalUrl,
                languages: buildHreflangAlternates(`/${PAGE_SLUG}`),
            },
            robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        };
    }

    // --- GENERIC METADATA ---
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
        robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    };
}

// ------------------------------------------------------------------------------------------------
// Helper: Saudi Specific Body Component
// ------------------------------------------------------------------------------------------------
async function SaudiBestCouponsRender({ country, locale, dir, currency, data, socialConfig, storeMap, catMap }: any) {
    // Format & sort coupons: highest discount first
    const today = new Date().toISOString().split("T")[0];
    const sortedCoupons = data.coupons
        .filter((c: any) => !c.expiryDate || c.expiryDate >= today)
        .sort((a: any, b: any) => (b.discountValue || 0) - (a.discountValue || 0))
        .slice(0, 30); // Max 30 for performance

    const faqs = [
        { question: "ما هو أفضل كود خصم اليوم؟", answer: "أفضل كود خصم اليوم يعتمد على المتجر الذي تود الشراء منه. نوفر في موقع ركن الكوبونات أفضل الأكواد لمتاجر مثل نون، أمازون، وشي إن بخصومات تصل إلى 70% وتحدث يومياً." },
        { question: "كيف أستخدم الكوبونات لضمان أفضل خصم؟", answer: "انسخ كود الخصم من موقعنا، وانتقل إلى المتجر المفضل لديك. بعد إضافة المنتجات إلى سلة التسوق، ألصق الكود في خانة 'الرمز الترويجي' أو 'كود الخصم' عند صفحة الدفع لتطبيق التخفيض مباشرة." },
        { question: "هل الكوبونات تعمل دائمًا؟", answer: "نعم! يقوم فريق التحقق في ركن الكوبونات باختبار كافة الأكواد المعروضة بشكل يومي لضمان فعاليتها على المشتريات وتوفير أفضل تجربة تسوق ممكنة للمستخدم." },
        { question: "هل يوجد شحن مجاني باستخدام الكوبونات؟", answer: "بعض أكواد الخصم توفر تفعيلاً مدمجاً للشحن المجاني، بينما توفر أخرى خصماً نقدياً أو نسبة مئوية. يُرجى قراءة تفاصيل الكوبون للتأكد من ميزة الشحن المجاني." }
    ];

    // JSON-LD: FAQ
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
        })),
    };

    // JSON-LD: ItemList
    const itemListSchema = sortedCoupons.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "أفضل كود خصم في السعودية 2026",
        "numberOfItems": sortedCoupons.length,
        "itemListElement": sortedCoupons.slice(0, 20).map((c: any, i: number) => {
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

    // JSON-LD: Breadcrumb
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": buildAbsoluteUrl(`/ar/sa`) },
            { "@type": "ListItem", "position": 2, "name": "أفضل كوبونات السعودية", "item": buildAbsoluteUrl(`/ar/sa/best-coupons`) },
        ],
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8 text-right" dir={dir}>
            {itemListSchema && <Script id="itemlist-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />}
            <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <div className="container mx-auto px-4">
                <nav aria-label="breadcrumb" className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/ar/sa`} className="hover:text-blue-600">الرئيسية</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">أفضل كوبونات السعودية</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <section className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-100">
                            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-600 mb-6">
                                <div className="flex items-center gap-1.5 bg-green-50 text-green-800 px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
                                    <span className="text-green-600 text-lg leading-none">✓</span>
                                    <span>تم التحقق اليوم</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                                    <span className="text-blue-600 text-base leading-none">🔄</span>
                                    <span>محدث يوميًا</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm">
                                    <span className="text-base leading-none">👥</span>
                                    <span>يستخدمه آلاف المستخدمين</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                                أفضل كود خصم في السعودية 2026 | كوبونات محدثة يوميًا
                            </h1>

                            <p className="text-gray-600 leading-relaxed text-base font-medium">
                                اكتشف <strong className="text-gray-900">أفضل كود خصم في السعودية 2026</strong> مع قائمة هائلة ومحدثة يوميًا لأبرز المتاجر الإلكترونية. سواء كنت تبحث عن تخفيضات استثنائية أو تود تفعيل أقوى <strong className="text-gray-900">كوبونات السعودية</strong> للحصول على شحن مجاني وهدايا، فقد جمعنا لك هنا مجموعة مختارة بعناية. فريقنا المتخصص يقوم ببحث وتجربة مستمرة لضمان توفير <strong className="text-gray-900">عروض اليوم</strong> التي تلبي احتياجاتك، لكي تتسوق بثقة واطمئنان مع كل <strong className="text-gray-900">كود خصم فعال</strong> مضمون 100%. احصل على التخفيض الأكبر الآن!
                            </p>
                        </section>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                            {sortedCoupons.map((coupon: any) => (
                                <CouponCardServer
                                    key={coupon.id}
                                    coupon={coupon}
                                    store={storeMap.get(coupon.storeId)}
                                    categoryName={catMap.get(storeMap.get(coupon.storeId)?.category || "") || undefined}
                                    countryCode={country}
                                    locale={locale}
                                    isLandingPage={true}
                                />
                            ))}
                        </div>

                        <section className="bg-gray-800 text-white rounded-3xl p-8 mb-12 shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                            <h2 className="text-2xl font-black mb-6 relative z-10">أبرز المتاجر المتوفرة في السعودية</h2>
                            <p className="text-gray-300 mb-6 text-sm relative z-10">استكشف أقوى الكوبونات المخصصة للمتاجر الكبرى لضمان توفير أفضل الأسعار عند إتمام عملية الشراء:</p>
                            <div className="flex flex-wrap gap-4 relative z-10">
                                <Link href="/ar/sa/noon" className="bg-gray-700 hover:bg-yellow-500 hover:text-black font-bold px-6 py-3 rounded-xl transition-colors shadow-sm text-sm border border-gray-600 hover:border-yellow-400">
                                    كود خصم نون
                                </Link>
                                <Link href="/ar/sa/amazon" className="bg-gray-700 hover:bg-orange-500 hover:text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm text-sm border border-gray-600 hover:border-orange-400">
                                    أفضل كوبونات أمازون
                                </Link>
                                <Link href="/ar/sa/stores" className="bg-gray-700 hover:bg-blue-600 hover:text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm text-sm border border-gray-600 hover:border-blue-500">
                                    تصفح كافة المتاجر
                                </Link>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <span className="text-blue-600">❓</span> الأسئلة الشائعة حول كوبونات السعودية
                            </h2>
                            <div className="space-y-4">
                                {faqs.map((faq, idx) => (
                                    <details key={idx} className="group border border-gray-100 rounded-xl overflow-hidden bg-gray-50 text-right">
                                        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-blue-50 transition-colors font-bold text-gray-800 text-base">
                                            <span>{faq.question}</span>
                                            <svg className="w-5 h-5 text-gray-400 group-open:-rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </summary>
                                        <div className="p-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-white">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))}
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
                            locale={locale as any}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

// ------------------------------------------------------------------------------------------------
// General Component Rendering
// ------------------------------------------------------------------------------------------------
export default async function BestCouponsPage({ params }: PageProps) {
    const { locale: rawLocale, country } = await params;
    const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
    const isEn = locale === "en";
    const dir = isEn ? "ltr" : "rtl";
    const currency = getCurrencyByCountry(country);

    const [data, socialConfig] = await Promise.all([
        getCountryData(country),
        getSocialConfig(),
    ]);

    const storeMap = new Map(data.stores.map(s => [s.id, s]));
    const catMap = new Map(data.categories.map(c => [c.slug, c.name]));

    // --- SAUDI OVERRIDE INJECTION ---
    if (locale === "ar" && country === "sa") {
        return <SaudiBestCouponsRender country={country} locale={locale} dir={dir} currency={currency} data={data} socialConfig={socialConfig} storeMap={storeMap} catMap={catMap} />;
    }

    // --- GENERIC BEST COUPONS FALLBACK LOGIC ---
    const pageDef = getLandingPageBySlug(PAGE_SLUG)!;
    const countryName = getCountryName(locale, country);
    const coupons = pageDef.filter(data.coupons);
    const topStores = data.stores.slice(0, 8);

    // JSON-LD: ItemList
    const itemListSchema = coupons.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": pageDef.content[locale].h1(countryName),
        "numberOfItems": coupons.length,
        "itemListElement": coupons.slice(0, 20).map((c, i) => {
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

    // JSON-LD: FAQ
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": pageDef.faqs[locale].map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
        })),
    };

    // JSON-LD: Breadcrumb
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
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
                            </div>
                        )}

                        <section className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">{isEn ? `🛍️ Popular Stores in ${countryName}` : `🛍️ المتاجر الشائعة في ${countryName}`}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {topStores.map(store => (
                                    <Link key={store.id} href={`/${locale}/${country}/${store.slug}`} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-sm font-medium text-gray-700">
                                        {store.logoUrl && <img src={store.logoUrl} alt="" className="w-6 h-6 rounded-full object-contain" loading="lazy" width={24} height={24} />}
                                        <span>{getStoreName(locale, store)}</span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">{isEn ? "Frequently Asked Questions" : "الأسئلة الشائعة"}</h2>
                            <div className="space-y-4">
                                {pageDef.faqs[locale].map((faq, idx) => (
                                    <details key={idx} className="group border border-gray-100 rounded-xl overflow-hidden">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 font-bold text-gray-800 text-sm">
                                            <span>{faq.question}</span>
                                            <svg className="w-5 h-5 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                        </summary>
                                        <div className="p-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">{faq.answer}</div>
                                    </details>
                                ))}
                            </div>
                        </section>

                        <section className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">{isEn ? "Explore More Deals" : "اكتشف المزيد من العروض"}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Link href={`/${locale}/${country}/today-deals`} className="bg-white rounded-xl p-4 text-center hover:shadow-md font-bold text-sm hover:text-blue-600">🔥 {isEn ? "Today's Deals" : "عروض اليوم"}</Link>
                                <Link href={`/${locale}/${country}/new-coupons`} className="bg-white rounded-xl p-4 text-center hover:shadow-md font-bold text-sm hover:text-blue-600">✨ {isEn ? "New Coupons" : "كوبونات جديدة"}</Link>
                                <Link href={`/${locale}/${country}/no-code-needed`} className="bg-white rounded-xl p-4 text-center hover:shadow-md font-bold text-sm hover:text-blue-600">🎯 {isEn ? "No Code Needed" : "عروض بدون كود"}</Link>
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
