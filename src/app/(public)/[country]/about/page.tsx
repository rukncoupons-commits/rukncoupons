import React from "react";
import { Metadata } from "next";
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

    if (!currentCountry) return { title: "عن الموقع - ركن الكوبونات" };

    return {
        title: `عن موقع ركن الكوبونات | كوبونات خصم لـ ${currentCountry.name}`,
        description: "تعرف على مهمتنا في توفير أفضل كوبونات الخصم والعروض الحصرية في الشرق الأوسط. موقع ركن الكوبونات هو وجهتك للتسوق الذكي.",
        alternates: {
            canonical: buildAbsoluteUrl(`/${country}/about`),
            languages: buildHreflangAlternates("/about"),
        },
    };
}

export default async function AboutPage({ params }: PageProps) {
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
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">عن موقع ركن الكوبونات</h1>
                                <p className="text-xl text-gray-500 font-medium">شريكك الذكي للتسوق وتوفير المال في الشرق الأوسط</p>
                            </div>

                            <div className="text-lg text-gray-600 leading-relaxed space-y-10 pl-[10%]">
                                <p>
                                    مرحباً بك في موقع <span className="text-blue-600 font-bold">"ركن الكوبونات"</span>، وجهتك الأولى للحصول على أحدث وأقوى كوبونات الخصم والعروض الحصرية للمتاجر الإلكترونية في الشرق الأوسط، مع تركيز خاص على المملكة العربية السعودية، مصر، والإمارات العربية المتحدة.
                                </p>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                        مهمتنا
                                    </h2>
                                    <p className="mb-4">
                                        في "ركن الكوبونات"، مهمتنا بسيطة: مساعدتك على توفير المال في كل عملية شراء عبر الإنترنت. نحن نؤمن بأن التسوق الذكي لا يعني التنازل عن الجودة، بل يعني الحصول على أفضل المنتجات بأفضل الأسعار الممكنة. نعمل بلا كلل لجمع وتحديث أكواد الخصم بشكل يومي لضمان حصولك على صفقات فعالة ومضمونة.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                        ماذا نقدم؟
                                    </h2>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                                        <li className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <strong className="block text-gray-900 mb-2 text-lg">📅 كوبونات محدثة يومياً</strong>
                                            <span className="text-sm">يقوم فريقنا بالبحث والتحقق من كل كوبون وعرض لضمان فعاليته قبل نشره على الموقع.</span>
                                        </li>
                                        <li className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <strong className="block text-gray-900 mb-2 text-lg">🌏 تغطية شاملة</strong>
                                            <span className="text-sm">نوفر كوبونات لمئات المتاجر المحلية والعالمية التي تخدم منطقتنا، من الأزياء إلى الإلكترونيات.</span>
                                        </li>
                                        <li className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <strong className="block text-gray-900 mb-2 text-lg">💎 عروض حصرية</strong>
                                            <span className="text-sm">بالتعاون مع شركائنا، نقدم أكواد خصم خاصة لن تجدها في أي مكان آخر.</span>
                                        </li>
                                        <li className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                            <strong className="block text-gray-900 mb-2 text-lg">🚀 سهولة الاستخدام</strong>
                                            <span className="text-sm">تصميم بسيط وسريع يتيح لك العثور على الكوبون ونسخه بضغطة زر واحدة.</span>
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                        قيمنا
                                    </h2>
                                    <p className="mb-6">نحن نلتزم بثلاث قيم أساسية توجه عملنا اليومي:</p>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mt-1 shrink-0 shadow-sm font-bold">✓</div>
                                            <div>
                                                <strong className="text-gray-900 text-lg">المصداقية:</strong>
                                                <p className="text-gray-600 mt-1"> ثقتك هي أولويتنا. نحن نضمن أن كل كوبون منشور على موقعنا تم التحقق منه ويعمل.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mt-1 shrink-0 shadow-sm font-bold">✓</div>
                                            <div>
                                                <strong className="text-gray-900 text-lg">التوفير:</strong>
                                                <p className="text-gray-600 mt-1"> هدفنا هو تحقيق أقصى قيمة لزوارنا. نحن نبحث عن الصفقات التي توفر لك المال الحقيقي.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm mt-1 shrink-0 shadow-sm font-bold">✓</div>
                                            <div>
                                                <strong className="text-gray-900 text-lg">البساطة:</strong>
                                                <p className="text-gray-600 mt-1"> تجربة المستخدم يجب أن تكون سهلة ومباشرة. لا تعقيدات، فقط توفير بضغطة زر.</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="bg-blue-600 p-10 rounded-[2.5rem] text-center mt-12 shadow-xl shadow-blue-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                                    <p className="font-black text-white text-2xl mb-3 relative z-10">شكراً لزيارتك موقع "ركن الكوبونات"</p>
                                    <p className="text-blue-100 text-lg relative z-10">نتمنى لك تجربة تسوق ممتعة وموفرة!</p>
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
