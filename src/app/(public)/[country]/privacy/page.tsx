import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country } = await params;
    const { currentCountry } = await getCountryData(country);

    if (!currentCountry) return { title: "سياسة الخصوصية - ركن الكوبونات" };

    return {
        title: `سياسة الخصوصية | موقع ركن الكوبونات لـ ${currentCountry.name}`,
        description: "اقرأ سياسة الخصوصية لموقع ركن الكوبونات لفهم كيفية جمعنا واستخدامنا وحمايتنا لبياناتك الشخصية وخصوصيتك.",
        alternates: {
            canonical: buildAbsoluteUrl(`/${country}/privacy`),
            languages: buildHreflangAlternates("/privacy"),
        },
    };
}

export default async function PrivacyPage({ params }: PageProps) {
    const { country } = await params;
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    return (
        <main className="min-h-screen bg-white py-12 text-right" dir="rtl">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white">
                            <div className="border-b border-gray-100 pb-6 mb-8">
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">سياسة الخصوصية</h1>
                                <p className="text-sm text-gray-400 font-mono">آخر تحديث: 22 فبراير 2026</p>
                            </div>

                            <div className="text-lg text-gray-600 leading-relaxed space-y-10 pl-[10%]">
                                <p>
                                    نحن في موقع <span className="font-bold text-gray-800">"ركن الكوبونات"</span> ("الموقع"، "نحن"، "لدينا") نحترم خصوصيتك ونلتزم بحمايتها. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا للمعلومات التي تقدمها عند استخدامك لموقعنا.
                                </p>

                                <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="text-3xl">📋</span> المعلومات التي نجمعها
                                    </h2>
                                    <p className="mb-6 text-base">نجمع نوعين من البيانات:</p>
                                    <ul className="space-y-4 text-base">
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-500 mt-1.5 shrink-0">●</span>
                                            <span><strong>معلومات تقدمها طوعاً:</strong> اسمك وبريدك الإلكتروني عند الاشتراك في نشرتنا البريدية أو استخدام نموذج "اتصل بنا".</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-500 mt-1.5 shrink-0">●</span>
                                            <span><strong>بيانات سلوك القراءة المجهولة (على صفحات المدونة فقط):</strong> عند زيارة مقالات المدونة، يجمع الموقع تلقائياً — دون تحديد هويتك — البيانات التالية: عمق التمرير، الوقت المُقضى، نوع الجهاز (موبايل/كمبيوتر)، مصدر الزيارة، عدد الفقرات المقروءة، وما إذا نقرت على كود خصم. لا يتم جمع أي معلومات شخصية تعريفية (لا IP ولا اسم ولا بريد).</span>
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-gray-800 mb-6 border-r-8 border-blue-600 pr-4">كيف نستخدم معلوماتك؟</h2>
                                    <p className="mb-6">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">1</span>
                                            <span className="text-base font-medium">لتحسين وتخصيص تجربتك على الموقع.</span>
                                        </li>
                                        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">2</span>
                                            <span className="text-base font-medium">لإرسال رسائل بريد إلكتروني دورية للمشتركين.</span>
                                        </li>
                                        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">3</span>
                                            <span className="text-base font-medium">للرد على استفساراتك وطلبات الدعم.</span>
                                        </li>
                                        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">4</span>
                                            <span className="text-base font-medium">لتحليل استخدام الموقع وتطوير خدماتنا.</span>
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-gray-800 mb-6 border-r-8 border-purple-600 pr-4">تحسين المحتوى بالذكاء الاصطناعي</h2>
                                    <div className="bg-purple-50 p-8 rounded-[2rem] border border-purple-100 text-gray-700 text-base shadow-sm">
                                        <p className="mb-4 font-black text-purple-900 text-lg">كيف يعمل؟</p>
                                        <p className="leading-relaxed mb-4">
                                            يستخدم الموقع محرك ذكاء اصطناعي داخلي يحلل بيانات سلوك القراءة المجمّعة والمجهولة (المذكورة أعلاه) لتحديد أفضل موضع لعرض كوبونات الخصم داخل مقالات المدونة. يعمل هذا المحرك على مستوى المقال ككل وليس على مستوى المستخدم الفردي — بمعنى أنه يحسب "في أي فقرة من هذا المقال يميل القراء للنقر على الكوبون" دون تتبع أي شخص بعينه.
                                        </p>
                                        <div className="p-4 bg-white/50 rounded-xl border border-purple-200">
                                            <p className="text-sm font-bold text-purple-800">✅ لا يتم تخزين أي معلومات شخصية تعريفية (لا IP، لا اسم، لا بريد) ضمن هذا النظام. جميع البيانات مجمّعة ومجهولة الهوية.</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-gray-800 mb-6 border-r-8 border-orange-500 pr-4">روابط الطرف الثالث</h2>
                                    <p className="leading-relaxed">
                                        يحتوي موقعنا على روابط لمتاجر ومواقع طرف ثالث (روابط أفلييت). عند النقر على هذه الروابط ومغادرة موقعنا، فإننا لا نتحكم في سياسات الخصوصية الخاصة بتلك المواقع. نوصي بقراءة سياسة الخصوصية الخاصة بكل موقع تزوره لضمان حمايتك.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-black text-gray-800 mb-6 border-r-8 border-green-600 pr-4">أمن البيانات</h2>
                                    <p className="leading-relaxed">
                                        نتخذ تدابير أمنية معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو الإتلاف. ومع ذلك، يرجى العلم أنه لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%.
                                    </p>
                                </section>

                                <div className="border-t border-gray-100 pt-10 mt-12 bg-gray-50 p-8 rounded-[2.5rem]">
                                    <h2 className="text-xl font-black text-gray-900 mb-4">هل لديك استفسار؟</h2>
                                    <p className="mb-6">إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يسعدنا تواصلك معنا.</p>
                                    <Link href={`/${country}/contact`} className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                        <span>📩</span>
                                        تواصل معنا الآن
                                    </Link>
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
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}
