import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";
import { Locale } from "@/lib/i18n";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const isEn = rawLocale === "en";
    const { currentCountry } = await getCountryData(country);

    if (!currentCountry) return { title: isEn ? "How We Verify Coupons - Rukn Coupons" : "كيف نتحقق من الكوبونات - ركن الكوبونات" };

    const countryName = isEn ? (currentCountry.nameEn || currentCountry.name) : currentCountry.name;

    return {
        title: isEn ? `How We Verify Coupons | Quality Assurance at Rukn Coupons ${countryName}` : `كيف نتحقق من الكوبونات | ضمان الجودة في ركن الكوبونات ${countryName}`,
        description: isEn
            ? "Discover our rigorous manual testing process. Learn how the Rukn Coupons team verifies every discount code daily to ensure valid and guaranteed savings for you."
            : "اكتشف عملية الاختبار اليدوية الصارمة لدينا. تعرف كيف يقوم فريق ركن الكوبونات بالتحقق من كل كود خصم يومياً لضمان توفير حقيقي ومضمون لك.",
        alternates: {
            canonical: buildAbsoluteUrl(`/${rawLocale}/${country}/how-we-verify-coupons`),
            languages: buildHreflangAlternates("/how-we-verify-coupons"),
        },
    };
}

export default async function HowWeVerifyPage({ params }: PageProps) {
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
                            <div className="border-b border-gray-100 pb-8 mb-10 text-center lg:text-start flex flex-col items-center lg:items-start">
                                <span className="bg-green-100 text-green-700 font-bold px-4 py-1.5 rounded-full text-sm mb-4 inline-flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    {isEn ? "Strict Quality Assurance" : "ضمان جودة صارم"}
                                </span>
                                <h1 className="text-3xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                                    {isEn ? "How We Verify Coupons" : "كيف نتحقق من الكوبونات"}
                                </h1>
                                <p className="text-lg text-gray-500 max-w-2xl font-medium">
                                    {isEn 
                                        ? "Our promise to you: No expired codes, no fake discounts. An inside look into our 4-step manual testing methodology." 
                                        : "وعدنا لك: لا للأكواد المنتهية، لا للخصومات الوهمية. نظرة من الداخل على منهجية الاختبار اليدوية المكونة من 4 خطوات."}
                                </p>
                            </div>

                            <div className="text-gray-600 leading-relaxed space-y-12">
                                
                                <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl relative overflow-hidden shadow-sm">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full -mr-10 -mt-10"></div>
                                    <p className="text-lg relative z-10 text-blue-900 font-medium">
                                        {isEn 
                                            ? "Nothing is more frustrating than reaching the checkout page with a cart full of items, only to find out the promo code is invalid. At Rukn Coupons, we've built an entire Quality Assurance team specifically to eliminate this frustration. Trust isn't just a word for us; it's our entire operational model."
                                            : "ليس هناك ما هو أكثر إحباطًا من الوصول إلى صفحة الدفع وعربة التسوق ممتلئة، لتكتشف أن الكود الترويجي غير صالح. في ركن الكوبونات، قمنا ببناء فريق كامل لضمان الجودة خصيصاً للقضاء على هذا الإحباط. الثقة ليست مجرد كلمة بالنسبة لنا؛ إنها نموذج عملنا بأكمله."}
                                    </p>
                                </div>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                        <span className="bg-blue-600 shrink-0 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md">⚙️</span>
                                        {isEn ? "Our 4-Step Verification Process" : "عملية التحقق المكونة من 4 خطوات"}
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Step 1 */}
                                        <div className="border border-gray-100 p-8 rounded-3xl hover:shadow-lg transition-shadow bg-white">
                                            <div className="text-4xl mb-4">🕵️‍♂️</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                {isEn ? "1. Sourcing from the Root" : "1. المصدر من الجذور"}
                                            </h3>
                                            <p className="text-sm">
                                                {isEn 
                                                    ? "We don't scrape random codes from the internet. We acquire our promo codes directly from our official affiliate networks and extensive direct relationships with the stores."
                                                    : "نحن لا ننسخ الأكواد العشوائية من الإنترنت. نحن نحصل على الأكواد الترويجية الخاصة بنا مباشرة من شبكاتنا الرسمية للتسويق بالعمولة وعلاقاتنا المباشرة الوثيقة مع المتاجر."}
                                            </p>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="border border-gray-100 p-8 rounded-3xl hover:shadow-lg transition-shadow bg-white">
                                            <div className="text-4xl mb-4">🛒</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                {isEn ? "2. Manual Cart Testing" : "2. اختبار سلة التسوق اليدوي"}
                                            </h3>
                                            <p className="text-sm">
                                                {isEn 
                                                    ? "Our editors actively add qualifying products to the real store's cart, proceed to checkout intuitively, and apply the code to ensure the monetary discount strictly applies."
                                                    : "يقوم فريق التحریر لدينا فعلياً بإضافة المنتجات المؤهلة إلى سلة المتجر الحقيقي، والانتقال إلى صفحة الدفع، وتطبيق الكود للتأكد من أن الخصم النقدي يتم تطبيقه بدقة."}
                                            </p>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="border border-gray-100 p-8 rounded-3xl hover:shadow-lg transition-shadow bg-white">
                                            <div className="text-4xl mb-4">📅</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                {isEn ? "3. Condition Validation" : "3. التحقق من الشروط"}
                                            </h3>
                                            <p className="text-sm">
                                                {isEn 
                                                    ? "Many codes have hidden terms. We strip away the mystery by verifying exactly what the code applies to (e.g. New Users Only, Min Spend $50, Excludes Sale items) and state it visibly on our coupons."
                                                    : "العديد من الأكواد لها شروط خفية. نحن نزيل الغموض بالتحقق تماماً مما يُطبق عليه الكود (مثلاً: للمستخدمين الجدد فقط، حد أدنى للسلة 50 دولار، يُستثنى المنتجات المخفضة) ونوضحها بشكل مرئي على صفقاتنا."}
                                            </p>
                                        </div>

                                        {/* Step 4 */}
                                        <div className="border border-gray-100 p-8 rounded-3xl hover:shadow-lg transition-shadow bg-white">
                                            <div className="text-4xl mb-4">🔄</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                {isEn ? "4. Continuous Monitoring" : "4. المراقبة المستمرة"}
                                            </h3>
                                            <p className="text-sm">
                                                {isEn 
                                                    ? "A code working today might expire tomorrow. Our dedicated system alerts our QA team when codes near their expiration dates, prompting an immediate re-test or removal."
                                                    : "الكود الذي يعمل اليوم قد ينتهي غداً. ينبه نظامنا المخصص فريق الجودة لدينا عندما تقترب الأكواد من تواريخ انتهائها، مما يستدعي إعادة اختبار فورية أو الإزالة."}
                                            </p>
                                        </div>

                                    </div>
                                </section>

                                <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center">
                                    <h2 className="text-2xl font-black text-gray-900 mb-4">
                                        {isEn ? "Community Powered Signals" : "إشارات مدعومة بالمجتمع"}
                                    </h2>
                                    <p className="max-w-2xl mx-auto mb-6 text-sm">
                                        {isEn 
                                            ? "Even with military-grade testing, stores can instantly revoke codes at their discretion. That is why we heavily monitor real-time user feedback. Whenever multiple users report an invalid code, we pull it from the active rotation within hours."
                                            : "حتى مع الاختبارات العالية الدقة، يمكن للمتاجر سحب الأكواد فجأة لسبب أو لآخر. لهذا السبب نراقب تعليقات المستخدمين في الوقت الفعلي بشكل مكثف. كلما أبلغ عدد من المستخدمين عن كود غير صالح، نسحبه من قائمة العمل الفعالة في غضون ساعات."}
                                    </p>
                                    <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full border border-gray-200 shadow-sm font-bold text-gray-700 text-sm">
                                        {isEn ? "Help us maintain quality:" : "ساعدنا في الحفاظ على الجودة:"}
                                        <Link href={`/${rawLocale}/${country}/contact`} className="text-blue-600 hover:text-blue-800 underline">
                                            {isEn ? "Report a broken code" : "أبلغ عن كود معطل"}
                                        </Link>
                                    </div>
                                </section>

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
