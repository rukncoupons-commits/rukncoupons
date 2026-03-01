import React from 'react';
import Link from 'next/link';

interface DynamicStoreContentProps {
    storeName: string;
    countryName: string;
    countryCode: string;
    storeCategory: string;
}

// Simple hash function for deterministic randomness
function stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Semantic variation dictionaries to avoid over-optimization
const getDiscountTerm = (hash: number) => {
    const terms = ['كوبون', 'كود خصم', 'رمز ترويجي', 'قسيمة تخفيض', 'عرض'];
    return terms[hash % terms.length];
};

export default function DynamicStoreContent({ storeName, countryName, countryCode, storeCategory }: DynamicStoreContentProps) {
    const hash = stringToHash(storeName);
    const term = getDiscountTerm(hash);
    const showYear = hash % 2 === 0;
    const year = showYear ? new Date().getFullYear().toString() : 'الحالي';

    // -------------------------------------------------------------------------
    // TEMPLATE VARIATIONS
    // -------------------------------------------------------------------------

    // Varied Intro Blocks
    const renderIntro = () => {
        const intros = [
            (
                <div key="intro" className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black text-gray-800 mb-4">كل ما تحتاج معرفته عن {storeName}</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        يعتبر {storeName} وجهة التسوق المفضلة للعديد من العملاء في {countryName} عندما يتعلق الأمر بمنتجات {storeCategory}. يحرص الموقع على توفير تجربة شراء فريدة تجمع بين الجودة والتوفير. من خلال تفعيل <strong>{term} {storeName}</strong> الذي اوفره لك، ستتمكن من خفض إجمالي مشترياتك بشكل ملحوظ. واجهة التسوق سهلة الاستخدام وتدعم خيارات دفع منوعة تناسب الجميع.
                    </p>
                </div>
            ),
            (
                <div key="intro" className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black text-gray-800 mb-4">نبذة عن تجربة الشراء من {storeName}</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        التسوق اونلاين في فئة {storeCategory} أصبح أسهل بكثير مع منصة بحجم {storeName}. تغطي خدمات المتجر جميع مناطق {countryName} مع سياسات إرجاع وضمانات قوية. لتسوق أكثر ذكاءً، تأكد من إدراج <strong>{term} {storeName}</strong> في سلة الشراء قبل إتمام الدفع. نوفر لك هنا أفضل العروض المجربة لتضمن حصولك على السعر الأمثل دائماً.
                    </p>
                </div>
            ),
            (
                <div key="intro" className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black text-gray-800 mb-4">دليلك للتسوق من {storeName} في {countryName}</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        إذا كنت تبحث عن تشكيلة متكاملة من {storeCategory}، فإن المتجر يلبي كافة احتياجاتك. سرعة التوصيل وخدمة العملاء الراقية تجعل من {storeName} خياراً لا غنى عنه. احرص دائماً على تطبيق <strong>{term} {storeName}</strong> المتجدد على منصتنا للحصول على خصومات إضافية حقيقية تتجاوز التخفيضات العادية.
                    </p>
                </div>
            ),
            (
                <div key="intro" className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black text-gray-800 mb-4">لماذا يُفضل المتسوقون {storeName}؟</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        السبب الرئيسي يعود لجودة خيارات {storeCategory} المتاحة والأسعار التنافسية. وبمجرد دمجك لمنتجاتهم الرائعة مع <strong>{term} {storeName}</strong> الذي نشاركه معك، تصل لنقطة التوفير المثالية. متجر {storeName} في {countryName} يبدع في طرح تشكيلات تواكب التطلعات الحديثة بلمسة اقتصادية.
                    </p>
                </div>
            )
        ];
        return intros[hash % 4];
    };

    // Varied How-To Blocks
    const renderHowTo = () => {
        const titles = [
            `خطوات تفعيل ${term} ${storeName}`,
            `كيف تطبق خصم ${storeName} بنجاح؟`,
            `طريقة الاستفادة من قسيمة ${storeName}`,
            `شرح تفعيل التخفيض في موقع ${storeName}`
        ];
        const title = titles[hash % 4];

        return (
            <div key="howto" className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-black text-gray-800 mb-4">{title}</h2>
                <div className="text-gray-600 text-sm leading-relaxed space-y-3">
                    <ul className={`space-y-2 mr-4 ${hash % 2 === 0 ? 'list-decimal list-inside' : 'list-disc list-outside ml-4'}`}>
                        <li>تصفح العروض المتوفرة لمتجر {storeName} في هذه الصفحة.</li>
                        <li>اختر الـ {term} الأنسب لطلبك واضغط على زر النسخ ليتم تحويلك للموقع تلقائياً.</li>
                        <li>قم بإضافة جميع منتجات {storeCategory} لسلة التسوق.</li>
                        <li>في قسم الدفع، ابحث عن مربع "ادخال الرمز الترويجي".</li>
                        <li>الصق الرمز وانقر على تطبيق لمشاهدة السعر الجديد المخصوم!</li>
                    </ul>
                </div>
            </div>
        );
    };

    // Varied Terms Blocks
    const renderTerms = () => {
        const structures = [
            (
                <div key="terms" className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black text-gray-800 mb-4">شروط وأحكام استخدام الـ {term}</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm mr-4">
                        <li>راجع تاريخ الصلاحية. معظم التخفيضات لها فترة زمنية محددة.</li>
                        <li>تأكد من تطبيق الحد الأدنى لقيمة المشتريات إن وُجد.</li>
                        <li>بعض العلامات التجارية الكبرى قد تكون مستثناة من أية تخفيضات إضافية.</li>
                    </ul>
                </div>
            ),
            (
                <div key="terms" className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-black text-gray-800 mb-4">ملاحظات هامة قبل الدفع</h2>
                    <p className="text-gray-600 leading-relaxed text-sm mb-3">
                        لضمان نجاح التخفيض في {storeName}، يرجى الانتباه للتالي: الرمز يكون صالحاً لاستخدام مرة واحدة للعميل في الغالب. ثانياً، قد لا يعمل الرمز مع المنتجات الخاضعة لخصومات التصفية النهائية. تأكد من إجمالي الفاتورة قبل إتمام عملية الدفع.
                    </p>
                </div>
            )
        ];
        return structures[hash % 2];
    };

    // Varied Tips Blocks
    const renderTips = () => {
        const isGrid = hash % 2 === 0;
        return (
            <div key="tips" className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-black text-green-700 mb-4">
                    💡 نصائح للتسوق الذكي من {storeName}
                </h2>
                {isGrid ? (
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">استغل أوقات التنزيلات الكبرى مثل الجمعة السوداء للحصول على أقوى {term}.</div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">حاول تجميع مشترياتك في طلب واحد لتخطي حاجز الشحن المجاني، مما يضاعف من قيمة التوفير.</div>
                    </div>
                ) : (
                    <ul className="list-disc space-y-3 text-sm text-gray-600 mr-5">
                        <li><strong>التنزيلات الموسمية:</strong> العروض ترتفع بشكل هائل في المناسبات والأعياد.</li>
                        <li><strong>الشحن:</strong> تفادى الرسوم عبر تجاوز الحد الأدنى للتوصيل المجاني.</li>
                        <li><strong>الاشتراك:</strong> القوائم البريدية للمتجر غالباً ما ترسل كوبونات حصرية كنوع من الترحيب.</li>
                    </ul>
                )}
            </div>
        );
    };

    // -------------------------------------------------------------------------
    // RANDOM ORDER GENERATION (Deterministic via hash)
    // -------------------------------------------------------------------------

    const sections = [
        renderIntro(),
        renderHowTo(),
        renderTerms(),
        renderTips()
    ];

    // Simple deterministic shuffle
    let currentIdx = sections.length, randomIndex;
    let seed = hash;
    while (currentIdx !== 0) {
        seed = (seed * 9301 + 49297) % 233280;
        randomIndex = Math.floor((seed / 233280) * currentIdx);
        currentIdx--;
        [sections[currentIdx], sections[randomIndex]] = [sections[randomIndex], sections[currentIdx]];
    }

    // Always ensure Intro is first logically, but internal content can drift
    const finalSections = [
        renderIntro(),
        ...sections.filter(s => s?.key !== 'intro') // Push the rest in randomized order
    ];


    return (
        <section className="mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            {finalSections}

            {/* Phase 4: Internal Linking Cross-Pollination (Un-templated Semantic Variations) */}
            <div className="mt-8 pt-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">اكتشف المزيد من خيارات التوفير</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                    <Link
                        href={`/${countryCode}/stores?category=${storeCategory}`}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors font-medium text-center"
                    >
                        استعرض متاجر {storeCategory}
                    </Link>
                    <Link
                        href={`/${countryCode}/ramadan-offers`}
                        className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-4 py-2 rounded-lg transition-colors font-medium border border-yellow-200 text-center"
                    >
                        🌙 أقوى عروض شهر رمضان
                    </Link>
                    <Link
                        href={`/${countryCode}/white-friday`}
                        className="bg-gray-800 text-white hover:bg-gray-900 px-4 py-2 rounded-lg transition-colors font-medium text-center"
                    >
                        🖤 تخفيضات البلاك فرايدي
                    </Link>
                    <Link
                        href={`/${countryCode}/stores`}
                        className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-medium text-center border border-gray-200"
                    >
                        دليل كافة العلامات التجارية
                    </Link>
                </div>
            </div>
        </section>
    );
}
