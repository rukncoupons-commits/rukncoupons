import React from "react";
import { Metadata } from "next";
import { getCountryData, getSocialConfig } from "@/lib/data-service";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { buildAbsoluteUrl, buildHreflangAlternates } from "@/lib/seo-helpers";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale: rawLocale, country } = await params;
    const isEn = rawLocale === "en";
    const { currentCountry } = await getCountryData(country);

    if (!currentCountry) return { title: isEn ? "About Us - Rukn Coupons" : "عن الموقع - ركن الكوبونات" };

    const countryName = isEn ? (currentCountry.nameEn || currentCountry.name) : currentCountry.name;

    return {
        title: isEn ? `About Us | Rukn Coupons for ${countryName}` : `عن موقع ركن الكوبونات | كوبونات خصم لـ ${countryName}`,
        description: isEn
            ? "Learn about our mission to provide the best discount coupons and exclusive offers in the Middle East. Rukn Coupons is your destination for smart shopping."
            : "تعرف على مهمتنا في توفير أفضل كوبونات الخصم والعروض الحصرية في الشرق الأوسط. موقع ركن الكوبونات هو وجهتك للتسوق الذكي.",
        alternates: {
            canonical: buildAbsoluteUrl(`/${rawLocale}/${country}/about`),
            languages: buildHreflangAlternates("/about"),
        },
    };
}

export default async function AboutPage({ params }: PageProps) {
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
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
                                    {isEn ? "About Rukn Coupons" : "عن موقع ركن الكوبونات"}
                                </h1>
                                <p className="text-xl text-gray-500 font-medium">
                                    {isEn ? "Your smart partner for shopping and saving money in the Middle East" : "شريكك الذكي للتسوق وتوفير المال في الشرق الأوسط"}
                                </p>
                            </div>

                            <div className={`text-lg text-gray-600 leading-relaxed space-y-10 ${isEn ? 'pr-[10%]' : 'pl-[10%]'}`}>
                                <p>
                                    {isEn ? (
                                        <>Welcome to <span className="text-blue-600 font-bold">"Rukn Coupons"</span>, your premier destination for the latest and most powerful discount coupons and exclusive offers for online stores in the Middle East, with a special focus on Saudi Arabia, Egypt, and the UAE.</>
                                    ) : (
                                        <>مرحباً بك في موقع <span className="text-blue-600 font-bold">"ركن الكوبونات"</span>، وجهتك الأولى للحصول على أحدث وأقوى كوبونات الخصم والعروض الحصرية للمتاجر الإلكترونية في الشرق الأوسط، مع تركيز خاص على المملكة العربية السعودية، مصر، والإمارات العربية المتحدة.</>
                                    )}
                                </p>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                        {isEn ? "Our Mission" : "مهمتنا"}
                                    </h2>
                                    <p className="mb-4">
                                        {isEn
                                            ? "At 'Rukn Coupons', our mission is simple: to help you save money on every online purchase. We believe that smart shopping doesn't mean compromising on quality, but rather getting the best products at the best possible prices. We work tirelessly to collect and update discount codes daily to ensure you get active and guaranteed deals."
                                            : "في \"ركن الكوبونات\"، مهمتنا بسيطة: مساعدتك على توفير المال في كل عملية شراء عبر الإنترنت. نحن نؤمن بأن التسوق الذكي لا يعني التنازل عن الجودة، بل يعني الحصول على أفضل المنتجات بأفضل الأسعار الممكنة. نعمل بلا كلل لجمع وتحديث أكواد الخصم بشكل يومي لضمان حصولك على صفقات فعالة ومضمونة."
                                        }
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                        {isEn ? "What Do We Offer?" : "ماذا نقدم؟"}
                                    </h2>
                                    <ul className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isEn ? 'text-left' : 'text-right'}`}>
                                        <li className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <strong className="block text-gray-900 mb-2 text-lg">📅 {isEn ? "Daily Updated Coupons" : "كوبونات محدثة يومياً"}</strong>
                                            <span className="text-sm">{isEn ? "Our team researches and verifies every coupon and deal to ensure its validity before publishing it to the site." : "يقوم فريقنا بالبحث والتحقق من كل كوبون وعرض لضمان فعاليته قبل نشره على الموقع."}</span>
                                        </li>
                                        <li className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <strong className="block text-gray-900 mb-2 text-lg">🌏 {isEn ? "Comprehensive Coverage" : "تغطية شاملة"}</strong>
                                            <span className="text-sm">{isEn ? "We provide coupons for hundreds of local and global stores serving our region, from fashion to electronics." : "نوفر كوبونات لمئات المتاجر المحلية والعالمية التي تخدم منطقتنا، من الأزياء إلى الإلكترونيات."}</span>
                                        </li>
                                        <li className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <strong className="block text-gray-900 mb-2 text-lg">💎 {isEn ? "Exclusive Offers" : "عروض حصرية"}</strong>
                                            <span className="text-sm">{isEn ? "In collaboration with our partners, we offer special discount codes you won't find anywhere else." : "بالتعاون مع شركائنا، نقدم أكواد خصم خاصة لن تجدها في أي مكان آخر."}</span>
                                        </li>
                                        <li className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <strong className="block text-gray-900 mb-2 text-lg">🚀 {isEn ? "Ease of Use" : "سهولة الاستخدام"}</strong>
                                            <span className="text-sm">{isEn ? "A simple and fast design that lets you find and copy your coupon with a single click." : "تصميم بسيط وسريع يتيح لك العثور على الكوبون ونسخه بضغطة زر واحدة."}</span>
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                        {isEn ? "Who We Are" : "من نحن"}
                                    </h2>
                                    <div className="bg-gray-50 border-l-4 border-blue-600 p-6 rounded-r-2xl text-gray-700 leading-relaxed shadow-sm">
                                        <p className="mb-4">
                                            {isEn 
                                                ? "Rukn Coupons was founded by a team of dedicated e-commerce enthusiasts and savings experts with over 10 years of experience in the Middle Eastern digital retail space. Our editorial team consists of native Arabic and English speakers who deeply understand local market nuances and the true value of every Riyal, Dirham, and Pound."
                                                : "تأسس موقع ركن الكوبونات على يد فريق من الخبراء والمتخصصين في التجارة الإلكترونية بحصيلة خبرة تتجاوز 10 سنوات في السوق الرقمي للشرق الأوسط. يضم فريق التحرير لدينا متحدثين أصليين باللغتين العربية والإنجليزية، يدركون تماماً الفروق الدقيقة في السوق المحلي والقيمة الحقيقية لكل ريال، درهم، وجنيه."}
                                        </p>
                                        <p>
                                            {isEn 
                                                ? "We are not just an automated aggregator. We are a team of real shoppers who passionately believe that everyone deserves to pay a fair price."
                                                : "نحن لسنا مجرد مجمّع آلي للكوبونات. نحن فريق من المتسوقين الحقيقيين الذين يؤمنون بشدة أن الجميع يستحق دفع سعر عادل ومخفض."}
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                        {isEn ? "How We Verify Coupons" : "كيف نتحقق من الكوبونات"}
                                    </h2>
                                    <p className="mb-4">
                                        {isEn
                                            ? "Trust is the absolute core of our platform. We know how frustrating it is to find a coupon code that doesn't work at checkout. That is why every single promo code on our website undergoes a rigorous manual testing process."
                                            : "الثقة هي الجوهر الأساسي لمنصتنا. نحن نعلم مدى الإحباط الذي يسببه العثور على رمز خصم لا يعمل عند الدفع. لذلك، يخضع كل رمز ترويجي على موقعنا لعملية اختبار يدوية صارمة."}
                                    </p>
                                    <p className="mb-6">
                                        {isEn
                                            ? "Our dedicated Quality Assurance (QA) team physically tests codes on the respective store's checkout pages daily. If a code fails to provide the promised discount, it is immediately removed or distinctly marked as expired."
                                            : "يقوم فريق ضمان الجودة (QA) المخصص لدينا باختبار الأكواد فعلياً على صفحات الدفع الخاصة بالمتاجر بشكل يومي. إذا فشل أي كود في توفير الخصم الموعود، تتم إزالته فوراً أو وضع علامة واضحة بأنه منتهي الصلاحية."}
                                    </p>
                                    <Link href={`/${rawLocale}/${country}/how-we-verify-coupons`} className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-6 py-3 rounded-full">
                                        {isEn ? "Read our full Verification Methodology →" : "اقرأ منهجية التحقق الكاملة الخاصة بنا ←"}
                                    </Link>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                        {isEn ? "Our Values" : "قيمنا"}
                                    </h2>
                                    <p className="mb-6">{isEn ? "We commit to three core values that guide our daily work:" : "نحن نلتزم بثلاث قيم أساسية توجه عملنا اليومي:"}</p>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mt-1 shrink-0 shadow-sm font-bold">✓</div>
                                            <div>
                                                <strong className="text-gray-900 text-lg">{isEn ? "Credibility:" : "المصداقية:"}</strong>
                                                <p className="text-gray-600 mt-1"> {isEn ? "Your trust is our priority. We ensure that every coupon published on our site works and is verified." : " ثقتك هي أولويتنا. نحن نضمن أن كل كوبون منشور على موقعنا تم التحقق منه ويعمل."}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mt-1 shrink-0 shadow-sm font-bold">✓</div>
                                            <div>
                                                <strong className="text-gray-900 text-lg">{isEn ? "Savings:" : "التوفير:"}</strong>
                                                <p className="text-gray-600 mt-1"> {isEn ? "Our goal is to maximize value for our visitors. We look for deals that save you real money." : " هدفنا هو تحقيق أقصى قيمة لزوارنا. نحن نبحث عن الصفقات التي توفر لك المال الحقيقي."}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mt-1 shrink-0 shadow-sm font-bold">✓</div>
                                            <div>
                                                <strong className="text-gray-900 text-lg">{isEn ? "Simplicity:" : "البساطة:"}</strong>
                                                <p className="text-gray-600 mt-1"> {isEn ? "The user experience should be easy and straightforward. No complications, just savings at the click of a button." : " تجربة المستخدم يجب أن تكون سهلة ومباشرة. لا تعقيدات، فقط توفير بضغطة زر."}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="bg-blue-600 p-10 rounded-[2.5rem] text-center mt-12 shadow-xl shadow-blue-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                                    <p className="font-black text-white text-2xl mb-3 relative z-10">
                                        {isEn ? "Thank you for visiting 'Rukn Coupons'" : "شكراً لزيارتك موقع \"ركن الكوبونات\""}
                                    </p>
                                    <p className="text-blue-100 text-lg relative z-10">
                                        {isEn ? "We wish you a pleasant and money-saving shopping experience!" : "نتمنى لك تجربة تسوق ممتعة وموفرة!"}
                                    </p>
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
