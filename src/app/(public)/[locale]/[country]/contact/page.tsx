import React from "react";
import { Metadata } from "next";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import ContactClient from "@/components/ContactClient";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const isEn = rawLocale === "en";
    const { currentCountry } = await getCountryData(country);

    if (!currentCountry) return { title: isEn ? "Contact Us - Rukn Coupons" : "اتصل بنا - ركن الكوبونات" };

    const countryName = isEn ? (currentCountry.nameEn || currentCountry.name) : currentCountry.name;

    return {
        title: isEn ? `Contact Us | Rukn Coupons for ${countryName}` : `اتصل بنا | موقع ركن الكوبونات لـ ${countryName}`,
        description: isEn
            ? "Contact the Rukn Coupons team. We receive your inquiries and suggestions to improve our services and help you save."
            : "تواصل مع فريق موقع ركن الكوبونات. نستقبل استفساراتكم واقتراحاتكم لتحسين خدماتنا ومساعدتكم في التوفير.",
        alternates: {
            canonical: buildAbsoluteUrl(`/${rawLocale}/${country}/contact`),
            languages: buildHreflangAlternates("/contact"),
        },
    };
}

export default async function ContactPage({ params }: PageProps) {
    const { locale: rawLocale, country } = await params;
    const isEn = rawLocale === "en";
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    return (
        <main className={`min-h-screen bg-gray-50 py-12 ${isEn ? 'text-left' : 'text-right'}`} dir={isEn ? "ltr" : "rtl"}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center mb-12">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 rotate-3 shadow-inner">
                                        📬
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4">{isEn ? "Contact Us" : "تواصل معنا"}</h1>
                                    <p className="text-gray-500 text-lg leading-relaxed">
                                        {isEn
                                            ? "We are here to help! Whether you have an inquiry, a suggestion, or encounter an issue, please feel free to message us."
                                            : "نحن هنا لمساعدتك! سواء كان لديك استفسار، اقتراح، أو واجهت مشكلة، لا تتردد في مراسلتنا."}
                                    </p>
                                </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                        <div className="bg-blue-50/50 p-6 rounded-2xl text-center border border-blue-100 shadow-sm transition-transform hover:-translate-y-1">
                                            <div className="text-3xl mb-3">⚡</div>
                                            <h3 className="font-bold text-gray-900 mb-2">{isEn ? "Fast Response" : "استجابة سريعة"}</h3>
                                            <p className="text-sm text-gray-600">{isEn ? "We aim to reply to all inquiries within 24 hours." : "نسعى للرد على جميع الاستفسارات خلال 24 ساعة."}</p>
                                        </div>
                                        <div className="bg-green-50/50 p-6 rounded-2xl text-center border border-green-100 shadow-sm transition-transform hover:-translate-y-1">
                                            <div className="text-3xl mb-3">🛡️</div>
                                            <h3 className="font-bold text-gray-900 mb-2">{isEn ? "Trusted Support" : "دعم موثوق"}</h3>
                                            <p className="text-sm text-gray-600">{isEn ? "Having trouble with a promo code? Let our QA team know." : "هل تواجه مشكلة مع كود خصم؟ أخبر فريق الجودة لدينا."}</p>
                                        </div>
                                        <div className="bg-purple-50/50 p-6 rounded-2xl text-center border border-purple-100 shadow-sm transition-transform hover:-translate-y-1">
                                            <div className="text-3xl mb-3">🏢</div>
                                            <h3 className="font-bold text-gray-900 mb-2">{isEn ? "Corporate Office" : "المكتب الرئيسي"}</h3>
                                            <p className="text-sm text-gray-600">{isEn ? "Dubai Silicon Oasis, DDP, UAE" : "واحة دبي للسيليكون، الإمارات"}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                        <ContactClient locale={rawLocale} />
                                    </div>
                            </div>
                        </div>
                    </div>

                    <aside className="lg:col-span-4 xl:col-span-3">
                        <Sidebar
                            ads={data.adBanners}
                            recentPosts={data.blogPosts.slice(0, 3)}
                            socialConfig={socialConfig}
                            storesCount={data.stores.length}
                            couponsCount={data.coupons.length}
                            countryCode={country}
                            locale={rawLocale}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}
