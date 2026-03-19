import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const isEn = rawLocale === "en";
    const { currentCountry } = await getCountryData(country);

    if (!currentCountry) return { title: isEn ? "Privacy Policy - Rukn Coupons" : "سياسة الخصوصية - ركن الكوبونات" };

    const countryName = isEn ? (currentCountry.nameEn || currentCountry.name) : currentCountry.name;

    return {
        title: isEn ? `Privacy Policy | Rukn Coupons for ${countryName}` : `سياسة الخصوصية | موقع ركن الكوبونات لـ ${countryName}`,
        description: isEn
            ? "Read the Rukn Coupons privacy policy to understand how we collect, use, and protect your personal data and privacy."
            : "اقرأ سياسة الخصوصية لموقع ركن الكوبونات لفهم كيفية جمعنا واستخدامنا وحمايتنا لبياناتك الشخصية وخصوصيتك.",
        alternates: {
            canonical: buildAbsoluteUrl(`/${rawLocale}/${country}/privacy`),
            languages: buildHreflangAlternates("/privacy"),
        },
    };
}

export default async function PrivacyPage({ params }: PageProps) {
    const { locale: rawLocale, country } = await params;
    const isEn = rawLocale === "en";
    const data = await getCountryData(country);
    const socialConfig = await getSocialConfig();

    return (
        <main className={`min-h-screen bg-white py-12 ${isEn ? 'text-left' : 'text-right'}`} dir={isEn ? "ltr" : "rtl"}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white">
                            <div className="border-b border-gray-100 pb-6 mb-8">
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                                    {isEn ? "Privacy Policy" : "سياسة الخصوصية"}
                                </h1>
                                <p className="text-sm text-gray-400 font-mono">
                                    {isEn ? "Last Updated: February 22, 2026" : "آخر تحديث: 22 فبراير 2026"}
                                </p>
                            </div>

                            <div className={`text-lg text-gray-600 leading-relaxed space-y-10 ${isEn ? 'pr-[10%]' : 'pl-[10%]'}`}>
                                <p>
                                    {isEn ? (
                                        <>Here at <span className="font-bold text-gray-800">"Rukn Coupons"</span> ("Site", "we", "our"), we respect your privacy and are committed to protecting it. This privacy policy explains how we collect, use, and safeguard the information you provide when using our site.</>
                                    ) : (
                                        <>نحن في موقع <span className="font-bold text-gray-800">"ركن الكوبونات"</span> ("الموقع"، "نحن"، "لدينا") نحترم خصوصيتك ونلتزم بحمايتها. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا للمعلومات التي تقدمها عند استخدامك لموقعنا.</>
                                    )}
                                </p>

                                <div className="bg-green-50 border border-green-100 p-6 rounded-3xl mb-12 shadow-sm text-green-900 font-medium relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-5 rounded-full -mr-10 -mt-10"></div>
                                    <div className="flex items-center gap-3 mb-3 relative z-10">
                                        <div className="text-3xl">🛡️</div>
                                        <h2 className="text-lg font-black">{isEn ? "Our Promise: We Do Not Sell Your Data" : "وعدنا: نحن لا نبيع بياناتك مطلقاً"}</h2>
                                    </div>
                                    <p className="text-base leading-relaxed relative z-10 text-green-800">
                                        {isEn 
                                            ? "As a premium coupon provider, our business model relies exclusively on affiliate partnerships with official stores. We never sell, rent, or digitally trade your personal information or email addresses to any third-party brokers under any circumstances." 
                                            : "بصفتنا مزود كوبونات موثوق، يعتمد نموذج عملنا بالكامل وبشكل حصري على شراكات التسويق بالعمولة المعترف بها مع المتاجر الرسمية. نحن لا نبيع أو نؤجر أو نتاجر ببياناتك الشخصية أو بريدك الإلكتروني لأي أطراف ثالثة تحت أي ظرف من الظروف."}
                                    </p>
                                </div>

                                <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="text-3xl">📋</span> {isEn ? "Information We Collect" : "المعلومات التي نجمعها"}
                                    </h2>
                                    <p className="mb-6 text-base">{isEn ? "We collect two types of data:" : "نجمع نوعين من البيانات:"}</p>
                                    <ul className="space-y-4 text-base">
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-500 mt-1.5 shrink-0">●</span>
                                            <span>
                                                {isEn ? (
                                                    <><strong>Information you provide voluntarily:</strong> Your name and email when subscribing to our newsletter or using the "Contact Us" form.</>
                                                ) : (
                                                    <><strong>معلومات تقدمها طوعاً:</strong> اسمك وبريدك الإلكتروني عند الاشتراك في نشرتنا البريدية أو استخدام نموذج "اتصل بنا".</>
                                                )}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <span className="text-blue-500 mt-1.5 shrink-0">●</span>
                                            <span>
                                                {isEn ? (
                                                    <><strong>Anonymous Reading Behavior Data (Blog pages only):</strong> When visiting blog articles, the site automatically collects — without identifying you — the following data: scroll depth, time spent, device type (mobile/desktop), traffic source, number of paragraphs read, and whether you clicked a discount code. No personally identifiable information (no IP, name, or email) is collected.</>
                                                ) : (
                                                    <><strong>بيانات سلوك القراءة المجهولة (على صفحات المدونة فقط):</strong> عند زيارة مقالات المدونة، يجمع الموقع تلقائياً — دون تحديد هويتك — البيانات التالية: عمق التمرير، الوقت المُقضى، نوع الجهاز (موبايل/كمبيوتر)، مصدر الزيارة، عدد الفقرات المقروءة، وما إذا نقرت على كود خصم. لا يتم جمع أي معلومات شخصية تعريفية (لا IP ولا اسم ولا بريد).</>
                                                )}
                                            </span>
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className={`text-2xl font-black text-gray-800 mb-6 border-blue-600 ${isEn ? 'border-l-8 pl-4' : 'border-r-8 pr-4'}`}>
                                        {isEn ? "How We Use Your Information?" : "كيف نستخدم معلوماتك؟"}
                                    </h2>
                                    <p className="mb-6">{isEn ? "We use the collected information for the following purposes:" : "نستخدم المعلومات التي نجمعها للأغراض التالية:"}</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">1</span>
                                            <span className="text-base font-medium">{isEn ? "To improve and personalize your experience on the site." : "لتحسين وتخصيص تجربتك على الموقع."}</span>
                                        </li>
                                        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">2</span>
                                            <span className="text-base font-medium">{isEn ? "To send periodic emails to subscribers." : "لإرسال رسائل بريد إلكتروني دورية للمشتركين."}</span>
                                        </li>
                                        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">3</span>
                                            <span className="text-base font-medium">{isEn ? "To respond to your inquiries and support requests." : "للرد على استفساراتك وطلبات الدعم."}</span>
                                        </li>
                                        <li className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">4</span>
                                            <span className="text-base font-medium">{isEn ? "To analyze site usage and improve our services." : "لتحليل استخدام الموقع وتطوير خدماتنا."}</span>
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className={`text-2xl font-black text-gray-800 mb-6 border-purple-600 ${isEn ? 'border-l-8 pl-4' : 'border-r-8 pr-4'}`}>
                                        {isEn ? "AI Content Optimization" : "تحسين المحتوى بالذكاء الاصطناعي"}
                                    </h2>
                                    <div className="bg-purple-50 p-8 rounded-[2rem] border border-purple-100 text-gray-700 text-base shadow-sm">
                                        <p className="mb-4 font-black text-purple-900 text-lg">{isEn ? "How it works?" : "كيف يعمل؟"}</p>
                                        <p className="leading-relaxed mb-4">
                                            {isEn
                                                ? "The site uses an internal AI engine that analyzes aggregated and anonymous reading behavior data (mentioned above) to determine the best placement for displaying discount coupons within blog articles. This engine works at the article level as a whole, not at the individual user level — meaning it calculates 'in which paragraph of this article readers tend to click the coupon' without tracking any specific person."
                                                : "يستخدم الموقع محرك ذكاء اصطناعي داخلي يحلل بيانات سلوك القراءة المجمّعة والمجهولة (المذكورة أعلاه) لتحديد أفضل موضع لعرض كوبونات الخصم داخل مقالات المدونة. يعمل هذا المحرك على مستوى المقال ككل وليس على مستوى المستخدم الفردي — بمعنى أنه يحسب \"في أي فقرة من هذا المقال يميل القراء للنقر على الكوبون\" دون تتبع أي شخص بعينه."
                                            }
                                        </p>
                                        <div className="p-4 bg-white/50 rounded-xl border border-purple-200">
                                            <p className="text-sm font-bold text-purple-800">
                                                {isEn
                                                    ? "✅ No personally identifiable information (no IP, no name, no email) is stored within this system. All data is aggregated and anonymized."
                                                    : "✅ لا يتم تخزين أي معلومات شخصية تعريفية (لا IP، لا اسم، لا بريد) ضمن هذا النظام. جميع البيانات مجمّعة ومجهولة الهوية."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className={`text-2xl font-black text-gray-800 mb-6 border-orange-500 ${isEn ? 'border-l-8 pl-4' : 'border-r-8 pr-4'}`}>
                                        {isEn ? "Third-Party Links" : "روابط الطرف الثالث"}
                                    </h2>
                                    <p className="leading-relaxed">
                                        {isEn
                                            ? "Our site contains links to third-party stores and websites (affiliate links). When you click these links and leave our site, we have no control over the privacy policies of those sites. We recommend reading the privacy policy of each site you visit to ensure your protection."
                                            : "يحتوي موقعنا على روابط لمتاجر ومواقع طرف ثالث (روابط أفلييت). عند النقر على هذه الروابط ومغادرة موقعنا، فإننا لا نتحكم في سياسات الخصوصية الخاصة بتلك المواقع. نوصي بقراءة سياسة الخصوصية الخاصة بكل موقع تزوره لضمان حمايتك."
                                        }
                                    </p>
                                </section>

                                <section>
                                    <h2 className={`text-2xl font-black text-gray-800 mb-6 border-green-600 ${isEn ? 'border-l-8 pl-4' : 'border-r-8 pr-4'}`}>
                                        {isEn ? "Data Security" : "أمن البيانات"}
                                    </h2>
                                    <p className="leading-relaxed">
                                        {isEn
                                            ? "We take reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure."
                                            : "نتخذ تدابير أمنية معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو الإتلاف. ومع ذلك، يرجى العلم أنه لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%."
                                        }
                                    </p>
                                </section>

                                <div className="border-t border-gray-100 pt-10 mt-12 bg-gray-50 p-8 rounded-[2.5rem]">
                                    <h2 className="text-xl font-black text-gray-900 mb-4">
                                        {isEn ? "Have a question?" : "هل لديك استفسار؟"}
                                    </h2>
                                    <p className="mb-6">
                                        {isEn ? "If you have any questions about this Privacy Policy, we are happy to hear from you." : "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يسعدنا تواصلك معنا."}
                                    </p>
                                    <Link href={`/${isEn ? 'en' : 'ar'}/${country}/contact`} className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                        <span>📩</span>
                                        {isEn ? "Contact Us Now" : "تواصل معنا الآن"}
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
                            locale={rawLocale}
                        />
                    </aside>
                </div>
            </div>
        </main>
    );
}
