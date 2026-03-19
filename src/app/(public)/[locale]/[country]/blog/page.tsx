import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import Script from "next/script";
import { buildAbsoluteUrl, buildHreflangAlternates, SITE_URL, COUNTRY_CONFIG } from "@/lib/seo-helpers";
import { isValidLocale, DEFAULT_LOCALE, getCountryName, type Locale } from "@/lib/i18n";
import { getStoreName } from "@/lib/locale-content";
import { Calendar, Tag } from "lucide-react";

// ISR: Regenerate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
    const isEn = locale === "en";
    const { currentCountry } = await getCountryData(country);
    const countryName = getCountryName(locale, country);

    if (!currentCountry) return { title: isEn ? "Blog - Rukn Coupons" : "مدونة نصائح التسوق - ركن الكوبونات" };

    const year = new Date().getFullYear();
    const title = isEn
        ? `Coupons Blog ${countryName} ${year} | Saving Tips & Best Deals`
        : `مدونة الكوبونات ${countryName} ${year} | نصائح التوفير وأفضل العروض`;
    const description = isEn
        ? `Discover smart shopping tips, coupon guides, and the best deals in ${countryName}. Expert articles to help you save money on every online purchase.`
        : `تعرف على طرق التوفير وأسرار التسوق الذكي في ${countryName}. شروحات للكوبونات ونصائح خبراء لتوفير المال في كل عملية شراء عبر الإنترنت.`;
    const canonicalUrl = buildAbsoluteUrl(`/${rawLocale}/${country}/blog`);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: `${SITE_URL}/og-blog.jpg`, width: 1200, height: 630, alt: isEn ? "Rukn Coupons Blog" : "مدونة ركن الكوبونات" }],
            locale: isEn ? "en_US" : (COUNTRY_CONFIG[currentCountry.code]?.locale || "ar_SA"),
            type: "website",
            url: canonicalUrl,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${SITE_URL}/og-blog.jpg`],
        },
        alternates: {
            canonical: canonicalUrl,
            languages: buildHreflangAlternates("/blog"),
        },
        robots: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
    };
}

export default async function BlogListPage({ params }: PageProps) {
    const { locale: rawLocale, country } = await params;
    const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
    const isEn = locale === "en";
    const dir = isEn ? "ltr" : "rtl";
    const countryName = getCountryName(locale, country);
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    const getCategoryName = (slug: string) => {
        const cat = data.categories.find(c => c.slug === slug);
        return isEn ? (cat?.nameEn || cat?.name || slug) : (cat?.name || slug);
    };

    const topStores = data.stores.slice(0, 6);

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": isEn ? "Home" : "الرئيسية", "item": buildAbsoluteUrl(`/${locale}/${country}`) },
            { "@type": "ListItem", "position": 2, "name": isEn ? "Blog" : "المدونة", "item": buildAbsoluteUrl(`/${locale}/${country}/blog`) },
        ],
    };

    return (
        <main className={`min-h-screen bg-gray-50 py-12 ${isEn ? 'text-left' : 'text-right'}`} dir={dir}>
            <Script id="blog-list-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${locale}/${country}`} className="hover:text-blue-600">{isEn ? "Home" : "الرئيسية"}</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">{isEn ? "Blog" : "المدونة"}</span>
                </nav>

                {/* H1 + SEO Intro */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">
                        {isEn ? `Coupons Blog — Shopping Tips & Deals in ${countryName}` : `مدونة الكوبونات — نصائح التسوق والعروض في ${countryName}`}
                    </h1>
                    <p className="text-gray-500 max-w-3xl leading-relaxed text-sm">
                        {isEn
                            ? `Welcome to the Rukn Coupons blog — your go-to resource for smart shopping in ${countryName}. Our expert team publishes daily articles covering coupon guides, store reviews, saving strategies, and seasonal deal roundups. Whether you're looking for the best promo codes for Noon, Amazon, or Shein, or want to learn how to maximize your savings during White Friday and Ramadan sales, you'll find actionable tips and verified insights right here. Stay ahead of the deals and never pay full price again.`
                            : `مرحباً بك في مدونة ركن الكوبونات — مصدرك الأول للتسوق الذكي في ${countryName}. ينشر فريق الخبراء لدينا مقالات يومية تغطي أدلة استخدام الكوبونات، مراجعات المتاجر، استراتيجيات التوفير، وملخصات أفضل العروض الموسمية. سواء كنت تبحث عن أفضل أكواد الخصم لنون، أمازون، أو شي إن، أو تريد تعلم كيفية تحقيق أقصى استفادة من تخفيضات الجمعة البيضاء ورمضان، ستجد هنا نصائح عملية ومعلومات موثوقة. ابقَ متقدماً على العروض ولا تدفع السعر الكامل أبداً.`
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        {data.blogPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {data.blogPosts.map((post) => (
                                    <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
                                        <Link href={`/${locale}/${country}/blog/${post.slug}`} className="block h-56 overflow-hidden relative group" aria-label={isEn ? `Article: ${post.titleEn || post.title}` : `صورة المقال: ${post.title}`}>
                                            <img src={post.image} alt={isEn ? (post.titleEn || post.title) : post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        </Link>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString(isEn ? "en-US" : "ar-SA") : ''}
                                                </span>
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                                                    {getCategoryName(post.category)}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight hover:text-blue-600 transition-colors">
                                                <Link href={`/${locale}/${country}/blog/${post.slug}`}>{isEn ? (post.titleEn || post.title) : post.title}</Link>
                                            </h2>
                                            <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">{isEn ? (post.excerptEn || post.excerpt) : post.excerpt}</p>
                                            <Link href={`/${locale}/${country}/blog/${post.slug}`} className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all" aria-label={isEn ? `Read more: ${post.titleEn || post.title}` : `قراءة المزيد عن: ${post.title}`}>
                                                <span>{isEn ? "Read More" : "قراءة المزيد"}</span>
                                                <span>{isEn ? "→" : "←"}</span>
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <div className="text-5xl mb-4">📝</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{isEn ? "No articles yet" : "لا توجد مقالات حالياً"}</h3>
                                <p className="text-gray-500">{isEn ? "New content is being created, please check back later." : "جاري كتابة محتوى جديد ومفيد، يرجى العودة لاحقاً."}</p>
                            </div>
                        )}

                        {/* Internal Links: Popular Stores */}
                        <section className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                {isEn ? `🛍️ Popular Stores in ${countryName}` : `🛍️ المتاجر الشائعة في ${countryName}`}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {topStores.map(store => (
                                    <Link
                                        key={store.id}
                                        href={`/${locale}/${country}/${store.slug}`}
                                        className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium text-gray-700"
                                    >
                                        {store.logoUrl && <img src={store.logoUrl} alt="" className="w-6 h-6 rounded-full object-contain" loading="lazy" width={24} height={24} />}
                                        <span>{isEn ? `${getStoreName(locale, store)} coupons` : `كوبونات ${getStoreName(locale, store)}`}</span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Cross-links to landing pages */}
                        <section className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                {isEn ? "Explore More Deals" : "اكتشف المزيد من العروض"}
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
