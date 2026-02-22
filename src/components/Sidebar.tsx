/**
 * Sidebar — Server Component (zero client JS)
 * Newsletter form isolated as tiny client island (NewsletterForm.tsx)
 * Lucide replaced with inline SVG to eliminate library from server render
 */
import React from "react";
import Link from "next/link";
import { AdBanner, BlogPost, SocialConfig } from "@/lib/types";
import NewsletterForm from "./NewsletterForm";

interface SidebarProps {
    ads: AdBanner[];
    recentPosts: BlogPost[];
    socialConfig: SocialConfig | null;
    storesCount: number;
    couponsCount: number;
    countryCode: string;
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
    facebook: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    ),
    twitter: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M18 4H6L2 20h7.5l2.5-8 2.5 8H22L18 4z" />
        </svg>
    ),
    instagram: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.95 1.96C5.12 19.5 12 19.5 12 19.5s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96 29 29 0 0 0 .45-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.49l6.5 3.26-6.5 3.27z" />
        </svg>
    ),
};

export default function Sidebar({ ads, recentPosts, socialConfig, storesCount, couponsCount, countryCode }: SidebarProps) {
    return (
        <aside className="space-y-8 text-right" dir="rtl">
            {/* Ad banners */}
            {ads.map((ad) => (
                <div key={ad.id} className="rounded-2xl overflow-hidden shadow-md bg-white">
                    {ad.type === "html" && ad.htmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: ad.htmlContent }} />
                    ) : (
                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative">
                            <img
                                src={ad.imageUrl}
                                alt={ad.altText || "إعلان"}
                                className="w-full h-auto"
                                loading="lazy"
                                width={300}
                                height={250}
                            />
                            <span className="absolute top-2 right-2 bg-white/90 text-[10px] font-bold px-2 py-0.5 rounded text-blue-600">
                                عرض مميز
                            </span>
                        </a>
                    )}
                </div>
            ))}

            {/* Newsletter — client island */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-2">نشــرة العروض السرية</h3>
                <p className="text-blue-100 text-sm mb-4">اشترك لتصلك أقوى الكوبونات الحصرية التي لا ننشرها على الموقع.</p>
                <NewsletterForm />
            </div>

            {/* Site stats — pure static HTML */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>إحصائيات الموقع</span>
                </h3>
                <dl className="space-y-3">
                    <div className="flex items-center justify-between">
                        <dt className="text-gray-700 text-sm font-medium">عدد المتاجر</dt>
                        <dd className="font-bold bg-gray-100 px-2 py-1 rounded text-xs">{storesCount}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="text-gray-700 text-sm font-medium">كوبونات فعالة</dt>
                        <dd className="font-bold bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{couponsCount}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="text-gray-700 text-sm font-medium">مستخدمين سعداء</dt>
                        <dd className="font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">+5000</dd>
                    </div>
                </dl>
            </div>

            {/* Recent blog posts */}
            {recentPosts.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <span>مقالات جديدة</span>
                    </h3>
                    <div className="space-y-4">
                        {recentPosts.map((post) => (
                            <Link key={post.id} href={`/${countryCode}/blog/${post.slug}`} className="flex gap-3 group">
                                <img
                                    src={post.image}
                                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                                    alt={post.title}
                                    loading="lazy"
                                    width={64}
                                    height={64}
                                />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 transition-colors">
                                        {post.title}
                                    </h4>
                                    <time className="text-xs text-gray-400 mt-1 block">
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                                    </time>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Social links — plain <a> tags, zero JS */}
            {socialConfig && Object.keys(socialConfig).some(k => k !== "upscrolled" && (socialConfig as any)[k]) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">تابعنا</h3>
                    <nav className="flex gap-3 justify-center flex-wrap" aria-label="روابط التواصل الاجتماعي">
                        {Object.entries(socialConfig).map(([key, value]) => {
                            if (!value || key === "upscrolled") return null;
                            return (
                                <a
                                    key={key}
                                    href={value as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    title={key}
                                    aria-label={key}
                                >
                                    {SOCIAL_ICONS[key] || (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                    )}
                                </a>
                            );
                        })}
                    </nav>
                </div>
            )}
        </aside>
    );
}
