import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryData, getPostBySlug, getSocialConfig, getCouponsForStore } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import CouponCardServer from "@/components/CouponCardServer";
import CouponCard from "@/components/CouponCard";
import Script from "next/script";
import { processBlogContent, extractToc } from "@/lib/auto-link";
import { User, ChevronDown, Facebook, Twitter, Mail, Tag } from "lucide-react";
import { buildHreflangAlternates, buildAbsoluteUrl, validateContentDepth } from "@/lib/seo-helpers";

import { injectCouponSSR } from "@/lib/ssr-injector";
import { BlogPost } from "@/lib/types";

// --- SSR Blog Content Parser (Phase 5) ---
// optimalInjectionIndex is pre-computed by processBlogContent() in auto-link.ts (Phase 3)
async function renderBlogContent(post: BlogPost, html: string, countryCode: string, stores: any[], getCouponsForStore: any, optimalInjectionIndex: number = 2) {
    const isMobile = false; // Server components don't have native window access
    const intentType = post.aiIntentType || 'informational';

    // Split by the exact macro pattern [COUPON_BLOCK:slug]
    const match = html.match(/\[COUPON_BLOCK:\s*([^\]]+)\]/i);

    if (match) {
        const storeSlug = match[1].trim();
        const store = stores.find(s => s.slug === storeSlug || s.id === storeSlug);

        if (store) {
            // Fetch coupons natively on the server during render
            const allCoupons = await getCouponsForStore(store.id, countryCode);
            const today = new Date().toISOString().split("T")[0];
            const activeCoupons = allCoupons.filter((c: any) => !c.expiryDate || c.expiryDate >= today).slice(0, 4);

            if (activeCoupons.length > 0) {
                // Generate the React Node for the Coupon Block
                let couponBlockNode: React.ReactNode = null;

                if (intentType === 'informational') {
                    couponBlockNode = (
                        <div className="my-8 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img src={store.logoUrl} alt={store.name} className="w-10 h-10 rounded-full bg-white border border-gray-100" />
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">هل تبحث عن خصم لمتجر {store.name}؟</p>
                                    <p className="text-xs text-gray-500">لدينا عروض فعالة الآن.</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto">
                                <CouponCardServer coupon={activeCoupons[0]} store={store} countryCode={countryCode} />
                            </div>
                        </div>
                    );
                } else if (intentType === 'commercial') {
                    couponBlockNode = (
                        <div className="my-10 bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm relative">
                            <span className="absolute -top-3 right-6 bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-full">أفضل الخيارات المتاحة</span>
                            <h2 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2">
                                عروض <span className="text-blue-600">{store.name}</span> المقترحة
                            </h2>
                            <div className="flex flex-col gap-4">
                                {activeCoupons.slice(0, 2).map((coupon: any) => (
                                    <CouponCardServer key={coupon.id} coupon={coupon} store={store} countryCode={countryCode} />
                                ))}
                            </div>
                        </div>
                    );
                } else {
                    couponBlockNode = (
                        <div className="my-10 bg-blue-50/30 rounded-3xl p-6 md:p-8 border-2 border-dashed border-blue-100/50 relative overflow-hidden group">
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-800">
                                <span className="leading-tight">أقوى وأحدث كوبونات <span className="text-blue-600">{store.name}</span></span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 w-full mb-2">
                                {activeCoupons.map((coupon: any) => (
                                    <CouponCardServer key={coupon.id} coupon={coupon} store={store} countryCode={countryCode} />
                                ))}
                            </div>
                        </div>
                    );
                }

                // Remove the macro from the text entirely so it doesn't render bare
                let cleanedHtml = html.replace(/\[COUPON_BLOCK:\s*([^\]]+)\]/gi, '');

                // Count paragraphs to enforce minimum content threshold
                const paragraphCount = (cleanedHtml.match(/<p>/gi) || []).length;

                if (paragraphCount > 2) {
                    // Phase 5: AST injection using the pre-computed Phase 3 index from auto-link.ts
                    return (
                        <div className="prose prose-lg prose-blue max-w-none prose-headings:font-black prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed blog-content break-words">
                            {injectCouponSSR(cleanedHtml, optimalInjectionIndex, couponBlockNode)}
                        </div>
                    );
                } else {
                    // Fallback for extremely short articles
                    return (
                        <div className="prose prose-lg prose-blue max-w-none prose-headings:font-black prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed blog-content break-words">
                            <div dangerouslySetInnerHTML={{ __html: cleanedHtml }} />
                            {couponBlockNode}
                        </div>
                    );
                }
            }
        }
    }

    // Default Fallback
    return (
        <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="prose prose-lg prose-blue max-w-none prose-headings:font-black prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed blog-content break-words"
        />
    );
}
// ---------------------------------------------

// ISR: Regenerate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ country: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country, slug } = await params;
    const post = await getPostBySlug(country, slug);
    const { currentCountry } = await getCountryData(country);

    if (!post || !currentCountry) return { title: "المقال - ركن الكوبونات" };

    const title = post.seo?.metaTitle || post.title;
    const description = post.seo?.metaDescription || post.excerpt;
    const canonical = post.seo?.canonicalUrl || buildAbsoluteUrl(`/${country}/blog/${slug}`);

    // Validate thin content against the raw DB content string
    const { isThin } = validateContentDepth(post.content || "");

    return {
        title: `${title} | ركن الكوبونات`,
        description,
        openGraph: {
            title,
            description,
            images: [post.image],
        },
        alternates: {
            canonical,
            languages: buildHreflangAlternates(`/blog/${slug}`),
        },
        robots: post.seo?.noIndex || isThin
            ? "noindex, nofollow"
            : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { country, slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const post = await getPostBySlug(country, decodedSlug);
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    if (!post || !data.currentCountry) {
        notFound();
        return null;
    }

    const { processedHtml, detectedStoreIds, anchorVariations, optimalInjectionIndex } = processBlogContent(post.content || "", data.stores, country, post, data.blogPosts);
    const toc = extractToc(post.content || "");

    // Resolve related coupons
    const manualCouponIds = post.manualCouponIds || [];
    const manualCoupons = data.coupons.filter(c => manualCouponIds.includes(c.id));

    // Also get some coupons from detected stores
    const autoCoupons: any[] = [];
    for (const storeId of detectedStoreIds) {
        const storeCoupons = await getCouponsForStore(storeId, country);
        autoCoupons.push(...storeCoupons.slice(0, 1));
    }

    const allRelatedCoupons = [...manualCoupons, ...autoCoupons].slice(0, 4);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.image,
        "author": { "@type": "Person", "name": post.author },
        "datePublished": post.createdAt,
        "description": post.excerpt
    };

    return (
        <main className="min-h-screen bg-gray-50 py-10 text-right" dir="rtl">
            <Script
                id="blog-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${country}`} className="hover:text-blue-600">الرئيسية</Link>
                    <span>/</span>
                    <Link href={`/${country}/blog`} className="hover:text-blue-600">المدونة</Link>
                    <span>/</span>
                    <span className="text-gray-800 truncate font-bold">{post.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Header Image */}
                            <div className="h-[300px] md:h-[400px] relative">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                                    <div className="flex gap-4 text-sm font-bold mb-4">
                                        <span className="bg-blue-600 px-3 py-1 rounded-full uppercase tracking-wider">
                                            {data.categories.find(c => c.slug === post.category)?.name || post.category}
                                        </span>
                                        <span className="flex items-center gap-1 opacity-90">{post.createdAt || ''}</span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-lg">
                                        {post.title}
                                    </h1>
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                {/* Author & TOC */}
                                <div className="flex flex-col md:flex-row gap-8 mb-10 border-b border-gray-100 pb-8">
                                    <div className="flex items-center gap-4 md:w-1/3">
                                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                            <User size={28} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">كتب بواسطة: {post.author}</p>
                                            <p className="text-xs text-gray-500 font-medium">خبير تسوق وتوفير</p>
                                        </div>
                                    </div>

                                    {toc.length > 0 && (
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 md:w-2/3">
                                            <p className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                                                <span>📋</span> محتويات المقال:
                                            </p>
                                            <ul className="space-y-2 text-sm text-blue-600 font-bold">
                                                {toc.map((item) => (
                                                    <li key={item.id} style={{ paddingRight: (item.level - 2) * 20 }}>
                                                        <a href={`#${item.id}`} className="hover:underline transition-colors flex items-center gap-1" aria-label={`انتقل إلى: ${item.text}`}>
                                                            <span>•</span>
                                                            {item.text}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Article Content (Smart Rendered) */}
                                <div className="pl-0 lg:pl-[5%]">
                                    {await renderBlogContent(post, processedHtml, country, data.stores, getCouponsForStore, optimalInjectionIndex)}
                                </div>

                                {/* FAQ */}
                                {post.faq && post.faq.length > 0 && (
                                    <div className="mt-12 bg-blue-50/50 rounded-3xl p-8 border border-blue-100">
                                        <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                                            <span className="text-3xl">❓</span> الأسئلة الشائعة
                                        </h2>
                                        <div className="space-y-4">
                                            {post.faq.map((item, i) => (
                                                <details key={i} className="group bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm transition-all duration-300">
                                                    <summary className="flex justify-between items-center font-bold p-5 cursor-pointer text-gray-800 hover:bg-blue-50/50 transition-colors list-none select-none">
                                                        <span>{item.question}</span>
                                                        <ChevronDown className="w-5 h-5 text-blue-500 transition-transform duration-300 group-open:rotate-180" />
                                                    </summary>
                                                    <div className="p-6 pt-0 text-gray-600 text-base leading-relaxed border-t border-blue-50 mt-2">
                                                        {item.answer}
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Related Coupons */}
                                {allRelatedCoupons.length > 0 && (
                                    <div className="mt-16 pt-12 border-t border-gray-100">
                                        <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                                            <span className="text-3xl">🔥</span> كوبونات وعروض موصى بها
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                            {allRelatedCoupons.map((coupon) => (
                                                <CouponCard
                                                    key={coupon.id}
                                                    coupon={coupon}
                                                    store={data.stores.find(s => s.id === coupon.storeId)}
                                                    categoryName={data.categories.find(c => c.slug === data.stores.find(s => s.id === coupon.storeId)?.category)?.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Social Share */}
                                <div className="mt-16 pt-10 border-t border-gray-100">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                        <p className="font-black text-gray-800 text-lg">شارك الفائدة مع أصدقائك:</p>
                                        <div className="flex gap-4">
                                            <button className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-all shadow-md">
                                                <Facebook />
                                            </button>
                                            <button className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-all shadow-md">
                                                <Twitter />
                                            </button>
                                            <button className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-all shadow-md">
                                                <Mail />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
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
