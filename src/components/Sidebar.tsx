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
    locale?: string;
}

const SOCIAL_BRANDS: Record<string, { icon: React.ReactNode; bg: string; label: string; labelEn: string }> = {
    facebook: {
        label: "فيسبوك",
        labelEn: "Facebook",
        bg: "bg-[#1877F2] hover:bg-[#0d65d9]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
        ),
    },
    twitter: {
        label: "إكس",
        labelEn: "X",
        bg: "bg-[#000000] hover:bg-[#222]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    instagram: {
        label: "انستقرام",
        labelEn: "Instagram",
        bg: "bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#dc2743] hover:opacity-90",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
            </svg>
        ),
    },
    youtube: {
        label: "يوتيوب",
        labelEn: "YouTube",
        bg: "bg-[#FF0000] hover:bg-[#cc0000]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.95 1.96C5.12 19.5 12 19.5 12 19.5s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96 29 29 0 0 0 .45-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.49l6.5 3.26-6.5 3.27z" />
            </svg>
        ),
    },
    tiktok: {
        label: "تيك توك",
        labelEn: "TikTok",
        bg: "bg-[#010101] hover:bg-[#222]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.39a8.16 8.16 0 0 0 4.76 1.52V7.46a4.83 4.83 0 0 1-1-.77z" />
            </svg>
        ),
    },
    snapchat: {
        label: "سناب شات",
        labelEn: "Snapchat",
        bg: "bg-[#FFFC00] hover:bg-[#e6e300]",
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000">
                <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.09-.03.176-.056.239-.07a.69.69 0 0 1 .2-.03c.27 0 .48.12.563.217.12.14.15.348.087.578-.165.6-.888.96-1.357 1.131l-.084.03c-.252.09-.455.163-.521.254-.07.095-.07.241-.07.385v.07c0 .118-.01.235-.024.35-.054.45-.2.9-.432 1.33-.62 1.14-1.625 2.012-2.993 2.596-.296.124-.553.22-.757.291l-.09.03c-.126.06-.18.127-.18.33 0 .15.09.3.27.45.24.18.57.33 1.005.54l.05.02c.29.139.639.306.975.507.63.36 1.06.87 1.2 1.44.06.24.03.45-.06.63a.8.8 0 0 1-.3.3c-.18.12-.39.18-.57.21a6.64 6.64 0 0 1-.93.09c-.24 0-.45-.015-.69-.045l-.15-.015c-.39-.045-.78-.105-1.215.015a9.16 9.16 0 0 0-.78.3c-.6.27-1.275.57-2.16.57a3.2 3.2 0 0 1-.18 0 3.2 3.2 0 0 1-.18 0c-.87 0-1.555-.3-2.16-.57a9.16 9.16 0 0 0-.78-.3c-.435-.12-.825-.06-1.215-.015l-.15.015c-.24.03-.45.045-.69.045a6.21 6.21 0 0 1-.93-.09 1.11 1.11 0 0 1-.57-.21.8.8 0 0 1-.3-.3c-.09-.18-.12-.39-.06-.63.15-.57.57-1.08 1.2-1.44.33-.195.69-.36.975-.51l.05-.02c.42-.21.765-.36 1.005-.54.18-.15.27-.3.27-.45 0-.21-.06-.27-.18-.33l-.09-.03c-.195-.07-.46-.17-.75-.29-1.37-.58-2.38-1.455-2.995-2.6a4.2 4.2 0 0 1-.435-1.33 2.66 2.66 0 0 1-.024-.35v-.07c0-.135 0-.285-.07-.385-.066-.09-.27-.165-.52-.255l-.085-.03c-.465-.17-1.19-.54-1.356-1.13-.064-.23-.034-.44.087-.58.084-.1.291-.22.563-.22.069 0 .134.01.2.03.064.012.15.04.24.07.266.1.62.216.922.213.195 0 .324-.04.398-.087a25.5 25.5 0 0 1-.033-.57c-.104-1.627-.23-3.654.3-4.848C7.85 1.07 11.2.793 12.207.793z" />
            </svg>
        ),
    },
};

export default function Sidebar({ ads, recentPosts, socialConfig, storesCount, couponsCount, countryCode, locale = "ar" }: SidebarProps) {
    const isEn = locale === "en";
    const dir = isEn ? "ltr" : "rtl";
    const textAlign = isEn ? "text-left" : "text-right";
    const prefix = `/${locale}/${countryCode}`;

    return (
        <aside className={`space-y-8 ${textAlign}`} dir={dir}>
            {/* Ad banners */}
            {ads.map((ad) => (
                <div key={ad.id} className="rounded-2xl overflow-hidden shadow-md bg-white">
                    {ad.type === "html" && ad.htmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: ad.htmlContent }} />
                    ) : (
                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative" aria-label={isEn ? `Ad: ${ad.altText || "Featured offer"}` : `إعلان: ${ad.altText || "إعلان مميز"}`}>
                            <img
                                src={ad.imageUrl}
                                alt={ad.altText || (isEn ? "Ad" : "إعلان")}
                                className="w-full h-auto"
                                loading="lazy"
                                width={300}
                                height={250}
                            />
                            <span className={`absolute top-2 ${isEn ? 'left-2' : 'right-2'} bg-white/90 text-[10px] font-bold px-2 py-0.5 rounded text-blue-600`}>
                                {isEn ? "Featured" : "عرض مميز"}
                            </span>
                        </a>
                    )}
                </div>
            ))}

            {/* Newsletter — client island */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-2">
                    {isEn ? "Secret Deals Newsletter" : "نشــرة العروض السرية"}
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                    {isEn
                        ? "Subscribe to receive exclusive coupons not published on the site."
                        : "اشترك لتصلك أقوى الكوبونات الحصرية التي لا ننشرها على الموقع."}
                </p>
                <NewsletterForm />
            </div>

            {/* Site stats — pure static HTML */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>{isEn ? "Site Statistics" : "إحصائيات الموقع"}</span>
                </h3>
                <dl className="space-y-3">
                    <div className="flex items-center justify-between">
                        <dt className="text-gray-700 text-sm font-medium">{isEn ? "Total Stores" : "عدد المتاجر"}</dt>
                        <dd className="font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm min-w-[2.5rem] text-center">{storesCount}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="text-gray-700 text-sm font-medium">{isEn ? "Active Coupons" : "كوبونات فعالة"}</dt>
                        <dd className="font-bold bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm min-w-[2.5rem] text-center">{couponsCount}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="text-gray-700 text-sm font-medium">{isEn ? "Happy Users" : "مستخدمين سعداء"}</dt>
                        <dd className="font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm min-w-[2.5rem] text-center">+5000</dd>
                    </div>
                </dl>
            </div>

            {/* Local City Links */}
            {(countryCode === "ae" || countryCode === "sa" || countryCode === "eg") && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{isEn ? "Local Deals" : "عروض محلية"}</span>
                    </h3>
                    <div className="flex flex-col gap-3">
                        {countryCode === "ae" && (
                            <>
                                <Link href={`${prefix}/dubai-coupons`} className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0"></span>
                                    {isEn ? "Dubai Coupon Codes" : "أفضل كود خصم في دبي"}
                                </Link>
                                <Link href={`${prefix}/abu-dhabi-coupons`} className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0"></span>
                                    {isEn ? "Abu Dhabi Coupons" : "أكواد خصم أبوظبي"}
                                </Link>
                            </>
                        )}
                        {countryCode === "sa" && (
                            <Link href={`${prefix}/riyadh-coupons`} className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0"></span>
                                {isEn ? "Riyadh Coupon Codes" : "أفضل كود خصم في الرياض"}
                            </Link>
                        )}
                        {countryCode === "eg" && (
                            <Link href={`${prefix}/cairo-coupons`} className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full shrink-0"></span>
                                {isEn ? "Cairo Coupon Codes" : "أقوى كود خصم في القاهرة"}
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Recent blog posts */}
            {recentPosts.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <span>{isEn ? "Recent Articles" : "مقالات جديدة"}</span>
                    </h3>
                    <div className="space-y-4">
                        {recentPosts.map((post) => (
                            <Link key={post.id} href={`${prefix}/blog/${post.slug}`} className="flex gap-3 group" aria-label={isEn ? `Read article: ${post.title}` : `اقرأ مقال: ${post.title}`}>
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
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString(isEn ? 'en-US' : undefined) : ''}
                                    </time>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Social links — branded icons, zero JS */}
            {socialConfig && Object.keys(socialConfig).some(k => k !== "upscrolled" && (socialConfig as any)[k]) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">
                        {isEn ? "Follow Us" : "تابعنا"}
                    </h3>
                    <nav className="flex gap-3 justify-center flex-wrap" aria-label={isEn ? "Social media links" : "روابط التواصل الاجتماعي"}>
                        {Object.entries(socialConfig).map(([key, value]) => {
                            if (!value || key === "upscrolled") return null;
                            const brand = SOCIAL_BRANDS[key];
                            if (!brand) return null;
                            const displayLabel = isEn ? brand.labelEn : brand.label;
                            return (
                                <a
                                    key={key}
                                    href={value as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${brand.bg}`}
                                    title={displayLabel}
                                    aria-label={displayLabel}
                                >
                                    {brand.icon}
                                </a>
                            );
                        })}
                    </nav>
                </div>
            )}
        </aside>
    );
}
