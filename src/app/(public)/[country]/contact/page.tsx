import React from "react";
import { Metadata } from "next";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import ContactClient from "@/components/ContactClient";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country } = await params;
    const { currentCountry } = await getCountryData(country);

    if (!currentCountry) return { title: "اتصل بنا - ركن الكوبونات" };

    return {
        title: `اتصل بنا | موقع ركن الكوبونات لـ ${currentCountry.name}`,
        description: "تواصل مع فريق موقع ركن الكوبونات. نستقبل استفساراتكم واقتراحاتكم لتحسين خدماتنا ومساعدتكم في التوفير.",
        alternates: {
            canonical: buildAbsoluteUrl(`/${country}/contact`),
            languages: buildHreflangAlternates("/contact"),
        },
    };
}

export default async function ContactPage({ params }: PageProps) {
    const { country } = await params;
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    return (
        <main className="min-h-screen bg-gray-50 py-12 text-right" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center mb-12">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 rotate-3 shadow-inner">
                                        📬
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4">تواصل معنا</h1>
                                    <p className="text-gray-500 text-lg leading-relaxed">
                                        نحن هنا لمساعدتك! سواء كان لديك استفسار، اقتراح، أو واجهت مشكلة، لا تتردد في مراسلتنا.
                                    </p>
                                </div>

                                <ContactClient />
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
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}
