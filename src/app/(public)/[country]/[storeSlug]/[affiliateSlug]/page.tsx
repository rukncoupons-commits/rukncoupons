import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { getCountryData, getStoreBySlug, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import AffiliateProductCard from "@/components/amazon/AffiliateProductCard";
import { AmazonTemplates } from "@/components/amazon/AmazonTemplates";
import { CheckCircle, ShieldCheck, Zap, ArrowLeft, ExternalLink } from "lucide-react";
import { buildAbsoluteUrl, buildHreflangAlternates, COUNTRY_CONFIG } from "@/lib/seo-helpers";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ country: string; storeSlug: string; affiliateSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country, storeSlug, affiliateSlug } = await params;

    // Only Amazon gets this feature for now
    if (!storeSlug.toLowerCase().includes('amazon')) return {};

    const template = AmazonTemplates.find(t => t.slug === affiliateSlug);
    if (!template) return {};

    const data = await getCountryData(country);
    const title = `${template.title} في ${data.currentCountry?.name} | ركن الكوبونات`;
    const description = `اكتشف ${template.title} مع دليل شراء شامل، مقارنة أسعار، وأفضل العروض المتاحة حالياً على أمازون ${data.currentCountry?.name}.`;
    const url = buildAbsoluteUrl(`/${country}/${storeSlug}/${affiliateSlug}`);

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            url,
            locale: COUNTRY_CONFIG[country]?.locale || "ar_SA",
        },
        alternates: {
            canonical: url,
            languages: buildHreflangAlternates(`/${storeSlug}/${affiliateSlug}`),
        }
    };
}

export default async function AffiliateHubPage({ params }: PageProps) {
    const { country, storeSlug, affiliateSlug } = await params;

    if (!storeSlug.toLowerCase().includes('amazon')) {
        notFound();
    }

    const template = AmazonTemplates.find(t => t.slug === affiliateSlug);
    if (!template) {
        notFound();
    }

    const [storeData, data, socialConfig] = await Promise.all([
        getStoreBySlug(country, storeSlug),
        getCountryData(country),
        getSocialConfig()
    ]);

    if (!storeData || !data.currentCountry) {
        notFound();
    }

    const todayDate = new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });

    // Article Structured Data
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${template.title} في ${data.currentCountry.name}`,
        "description": `دليل شراء شامل حول ${template.title}`,
        "datePublished": new Date().toISOString().split('T')[0],
        "dateModified": new Date().toISOString(),
        "author": {
            "@type": "Organization",
            "name": "فريق تحرير ركن الكوبونات"
        },
        "publisher": {
            "@id": buildAbsoluteUrl("/#organization")
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8 text-right" dir="rtl">
            <Script
                id="article-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${country}`} className="hover:text-blue-600">الرئيسية</Link>
                    <span>/</span>
                    <Link href={`/${country}/${storeSlug}`} className="hover:text-blue-600">{storeData.store.name}</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">{template.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">

                        {/* Article Hero */}
                        <article className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-6">
                                <Zap className="w-3.5 h-3.5" />
                                دليل الشراء التقني
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                                {template.title} في {data.currentCountry.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
                                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    مُراجَع ومُدقق
                                </div>
                                <span>آخر تحديث: <strong>{todayDate}</strong></span>
                                <span>الكاتب: <strong>فريق الخبراء</strong></span>
                            </div>

                            <div className="prose prose-blue max-w-none text-gray-700 text-lg leading-relaxed">
                                <p className="lead text-xl text-gray-800 font-medium mb-6">
                                    يبحث الكثير من المتسوقين في {data.currentCountry.name} عن <strong>{template.title}</strong> التي تجمع بين الجودة العالية والسعر المناسب. في هذا الدليل الشامل، قمنا بمقارنة ومراجعة أفضل الخيارات المتاحة حالياً على متجر أمازون لنسهل عليك قرار الشراء.
                                </p>

                                <p>
                                    تسوق المنتجات عبر الإنترنت أصبح يتطلب بحثاً دقيقاً لتجنب المنتجات الرديئة. لقد قمنا بتصفية آلاف التقييمات واختيار المنتجات التي يثق بها المستخدمون وتأتي بضمان فعّال وتسليم سريع من خلال خدمة Amazon Prime.
                                </p>
                            </div>
                        </article>

                        {/* Top 3 Products Recommendations */}
                        <h2 className="text-2xl font-black text-gray-800 mb-6">أفضل الترشيحات التي ننصح بها</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {/* Mock Data for Layout Structure */}
                            <AffiliateProductCard
                                title="الخيار الأفضل والممتاز"
                                description="المنتج الذي يجمع بين أعلى المواصفات المطلوبة بناءً على مراجعات الخبراء."
                                imageUrl="https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SX679_.jpg"
                                rating={4.9}
                                reviewsCount={12450}
                                affiliateUrl="https://amzn.to/example"
                                badge="أفضل اختيار ترشيحاً"
                            />
                            <AffiliateProductCard
                                title="الخيار الاقتصادي الأوفر"
                                description="إذا كانت ميزانيتك محدودة، فهذا المنتج يعطيك أفضل مواصفات مقابل كل ريال تدفعه."
                                imageUrl="https://m.media-amazon.com/images/I/719C6bJv8jL._AC_SX679_.jpg"
                                rating={4.5}
                                reviewsCount={8500}
                                affiliateUrl="https://amzn.to/example"
                                badge="أفضل قيمة"
                            />
                            <AffiliateProductCard
                                title="الخيار الأكثر مبيعاً"
                                description="المنتج الأكثر ثقة لدى المتسوقين في المنطقة والذي حصد أعلى نسبة مبيعات."
                                imageUrl="https://m.media-amazon.com/images/I/51wY-14rCPL._AC_SX679_.jpg"
                                rating={4.7}
                                reviewsCount={34200}
                                affiliateUrl="https://amzn.to/example"
                                badge="الأكثر طلباً"
                            />
                        </div>

                        {/* Buying Guide Section (Long-Form Content) */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
                            <h2 className="text-2xl font-black text-gray-800 mb-6">دليل الشراء: كيف تختار {template.title.split('أفضل ')[1] || 'المنتج المناسب'}؟</h2>

                            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                                <p>
                                    متجر أمازون {data.currentCountry.name} يقدم ملايين المنتجات، مما قد يجعل عملية الاختيار صعبة ومربكة. قبل إتمام عملية الشراء وتحويل الأموال، يُنصح بشدة مراعاة المعايير التالية لضمان الحصول على منتج يلبي احتياجاتك بدقة:
                                </p>

                                <ul className="list-disc pr-6 space-y-4 font-medium text-gray-800">
                                    <li><strong>تقييمات المستخدمين الفعليين:</strong> اقرأ دائماً المراجعات ذات النجمة الواحدة والمراجعات التي تحتوي على صور للمنتج الفعلي. لا تعتمد فقط على التقييم الإجمالي (النجوم).</li>
                                    <li><strong>سياسة الإرجاع والضمان:</strong> تأكد من أن المنتج مباع من قِبل "Amazon.sa" مباشرة أو على الأقل مشحون عن طريق "تشحن من أمازون (FBA)" لضمان سياسة الإرجاع السهلة والمجانية خلال 15 يوماً.</li>
                                    <li><strong>مقارنة الأسعار التاريخية:</strong> كن حذراً من التخفيضات الوهمية. ابحث دائماً عن علامة التخفيض الحقيقي وتأكد من السعر الأصلي.</li>
                                    <li><strong>الاعتماد على منتجات البرايم (Prime):</strong> الاشتراك في خدمة برايم يوفر لك التوصيل المجاني والسريع لليوم التالي والتوصيل المجاني لبعض المشتريات الدولية.</li>
                                </ul>

                                <blockquote className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-l-xl text-blue-900 font-medium my-6 italic">
                                    "دائماً تأكد من حالة السلعة (جديدة أو مستعملة كأنها جديدة). العديد من العروض الممتازة تتوفر في قسم Amazon Warehouse بخصومات تصل إلى 40% على الأجهزة المفتوحة."
                                </blockquote>
                            </div>
                        </div>

                        {/* Quick Comparison Table */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10 overflow-hidden">
                            <h2 className="text-2xl font-black text-gray-800 mb-6">جدول مقارنة سريع</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                            <th className="p-4 font-bold border-b-2 border-gray-200">المنتج</th>
                                            <th className="p-4 font-bold border-b-2 border-gray-200 text-center">التقييم</th>
                                            <th className="p-4 font-bold border-b-2 border-gray-200 text-center">العلامة</th>
                                            <th className="p-4 font-bold border-b-2 border-gray-200 text-center">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[1, 2, 3].map((item) => (
                                            <tr key={item} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 font-medium text-gray-800 hover:text-blue-600 line-clamp-1 max-w-[200px]">
                                                    اسم المنتج الكامل الذي يوضح التفاصيل التقنية بدقة
                                                </td>
                                                <td className="p-4 text-center text-amber-500 font-bold">4.8 ⭐</td>
                                                <td className="p-4 text-center">
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">خيارات ممتازة</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <a href="https://amzn.to/example" className="text-blue-600 font-bold text-xs hover:underline inline-flex items-center gap-1">
                                                        عرض السعر <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Similar Hub Pages (Internal Linking Map Phase 5) */}
                        <div className="mb-10">
                            <h2 className="text-xl font-black text-gray-800 mb-4">أدلة ومراجعات ذات صلة</h2>
                            <div className="flex flex-wrap gap-3">
                                {AmazonTemplates.filter(t => t.slug !== affiliateSlug).slice(0, 8).map(t => (
                                    <Link
                                        key={t.slug}
                                        href={`/${country}/${storeSlug}/${t.slug}`}
                                        className="bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 transition-colors shadow-sm flex items-center gap-2 group"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform group-hover:-translate-x-1 transition-all" />
                                        {t.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>

                    <aside className="lg:col-span-4 xl:col-span-3">
                        {/* Phase 5 & 6: Authority passing sticky sidebar widget targeted for Amazon Hub */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                            <ShieldCheck className="w-10 h-10 text-blue-400 mb-4" />
                            <h3 className="text-xl font-black mb-3 leading-tight">شراء آمن ومضمون من أمازون</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                جميع المنتجات الموصى بها في هذا الدليل مختارة بعناية ومُراجعة من قِبل خبراء موثوقين، وننصح دائماً باختيار السلع التي تُشحن من Amazon مباشرة لضمان حقوقك واسترجاع أموالك بسرعة وبسهولة إن لزم الأمر.
                            </p>
                            <a
                                href="https://amazon.sa"
                                target="_blank"
                                rel="nofollow noopener sponsored"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                تصفح عروض أمازون المباشرة
                                <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                        </div>

                        <Sidebar
                            ads={[]}
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
