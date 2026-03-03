import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import Script from "next/script";
import { buildAbsoluteUrl, buildHreflangAlternates, SITE_URL, COUNTRY_CONFIG } from "@/lib/seo-helpers";
import { Calendar, Tag } from "lucide-react";

// ISR: Regenerate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country } = await params;
    const { currentCountry } = await getCountryData(country);

    if (!currentCountry) return { title: "مدونة نصائح التسوق - ركن الكوبونات" };

    return {
        title: `مدونة نصائح التسوق في ${currentCountry.name} | ركن الكوبونات`,
        description: `تعرف على طرق التوفير وأسرار التسوق الذكي في ${currentCountry.name}. شروحات للكوبونات وعروض المتاجر.`,
        alternates: {
            canonical: buildAbsoluteUrl(`/${currentCountry.code}/blog`),
            languages: buildHreflangAlternates("/blog"),
        },
        openGraph: {
            title: `مدونة نصائح التسوق في ${currentCountry.name} | ركن الكوبونات`,
            description: `تعرف على طرق التوفير وأسرار التسوق الذكي في ${currentCountry.name}. شروحات للكوبونات وعروض المتاجر.`,
            images: [
                {
                    url: `${SITE_URL}/og-blog.jpg`,
                    width: 1200,
                    height: 630,
                    alt: "مدونة ركن الكوبونات",
                }
            ],
            locale: COUNTRY_CONFIG[currentCountry.code]?.locale || "ar_SA",
            type: "website",
        }
    };
}

export default async function BlogListPage({ params }: PageProps) {
    const { country } = await params;
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    const getCategoryName = (slug: string) => data.categories.find(c => c.slug === slug)?.name || slug;

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": buildAbsoluteUrl(`/${country}`) },
            { "@type": "ListItem", "position": 2, "name": "المدونة", "item": buildAbsoluteUrl(`/${country}/blog`) },
        ],
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12 text-right" dir="rtl">
            <Script id="blog-list-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">مدونة نصائح التسوق</h1>
                    <p className="text-gray-500 max-w-2xl">أحدث المقالات، شروحات استخدام الكوبونات، وأفضل مواسم التخفيضات في {data.currentCountry?.name}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        {data.blogPosts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {data.blogPosts.map((post) => (
                                    <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
                                        <Link href={`/${country}/blog/${post.slug}`} className="block h-56 overflow-hidden relative group" aria-label={`صورة المقال: ${post.title}`}>
                                            <img src={post.image} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        </Link>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                                                </span>
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                                                    {getCategoryName(post.category)}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight hover:text-blue-600 transition-colors">
                                                <Link href={`/${country}/blog/${post.slug}`}>{post.title}</Link>
                                            </h2>
                                            <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">{post.excerpt}</p>
                                            <Link href={`/${country}/blog/${post.slug}`} className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all" aria-label={`قراءة المزيد عن: ${post.title}`}>
                                                <span>قراءة المزيد</span>
                                                <span>←</span>
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <div className="text-5xl mb-4">📝</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد مقالات حالياً</h3>
                                <p className="text-gray-500">جاري كتابة محتوى جديد ومفيد، يرجى العودة لاحقاً.</p>
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
