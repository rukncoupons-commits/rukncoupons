/**
 * landing-page-content.ts — Centralized content for SEO landing pages
 *
 * Each landing page has:
 *  - slug (URL segment)
 *  - filter function (filters from getCountryData() coupons — NO new Firestore queries)
 *  - bilingual SEO metadata (ar + en)
 *  - bilingual intro text
 *  - bilingual FAQs
 */

import type { Coupon } from "./types";
import type { Locale } from "./i18n";

// ─── Page Definitions ────────────────────────────────────────────────────────

export interface LandingPageDef {
    slug: string;
    filter: (coupons: Coupon[]) => Coupon[];
    seo: Record<Locale, {
        title: (countryName: string, year: number) => string;
        description: (countryName: string) => string;
    }>;
    content: Record<Locale, {
        h1: (countryName: string) => string;
        intro: (countryName: string) => string;
    }>;
    faqs: Record<Locale, { question: string; answer: string }[]>;
}

const today = () => new Date().toISOString().split("T")[0];

export const LANDING_PAGES: LandingPageDef[] = [
    // ─── Best Coupons ────────────────────────────────────────────────────────
    {
        slug: "best-coupons",
        filter: (coupons) => {
            const d = today();
            return coupons
                .filter(c => c.isActive !== false && (!c.expiryDate || c.expiryDate >= d))
                .sort((a, b) => {
                    const scoreA = (a.votesUp - a.votesDown) + (a.usedCount * 0.5);
                    const scoreB = (b.votesUp - b.votesDown) + (b.usedCount * 0.5);
                    return scoreB - scoreA;
                })
                .slice(0, 30);
        },
        seo: {
            ar: {
                title: (c, y) => `أفضل كوبونات وأكواد خصم ${c} ${y} (خصم حتى 70% + شحن مجاني)`,
                description: (c) => `اكتشف أفضل الكوبونات وأكواد الخصم الفعّالة في ${c}. عروض حصرية ومتجددة يومياً لأشهر المتاجر مثل نون وأمازون وشي إن. وفّر أكثر مع ركن الكوبونات.`,
            },
            en: {
                title: (c, y) => `Best Coupon Codes ${c} ${y} – Up to 70% OFF + Free Shipping`,
                description: (c) => `Discover the best and most popular coupon codes in ${c}. Exclusive daily-updated deals for top stores like Noon, Amazon, and Shein. Save more with Rukn Coupons.`,
            },
        },
        content: {
            ar: {
                h1: (c) => `أفضل كوبونات وأكواد الخصم في ${c}`,
                intro: (c) => `اكتشف مجموعة مختارة بعناية من أفضل الكوبونات وأكواد الخصم المتاحة حالياً في ${c}. نقوم بتحديث هذه الصفحة يومياً لنقدم لك أقوى العروض من أشهر المتاجر. سواء كنت تبحث عن خصم على الإلكترونيات، الأزياء، أو التسوق اليومي، ستجد هنا أكواد خصم مجربة ومُتحقق منها تساعدك على توفير المال في كل عملية شراء. كل كوبون يتم اختباره والتحقق منه بواسطة فريقنا قبل إضافته إلى القائمة.`,
            },
            en: {
                h1: (c) => `Best Coupon Codes & Deals in ${c}`,
                intro: (c) => `Discover a carefully curated selection of the best coupons and discount codes currently available in ${c}. We update this page daily to bring you the strongest deals from the most popular stores. Whether you're looking for discounts on electronics, fashion, or everyday shopping, you'll find verified and tested coupon codes here that help you save money on every purchase. Each coupon is tested and verified by our team before being added to the list.`,
            },
        },
        faqs: {
            ar: [
                { question: "ما هو أفضل كود خصم متاح اليوم؟", answer: "نقوم بتحديث هذه الصفحة يومياً بأفضل أكواد الخصم المتاحة. الكوبونات مرتبة حسب الشعبية والتقييم، فالكود الأول في القائمة هو غالباً الأفضل." },
                { question: "كيف أستخدم كود الخصم؟", answer: "انسخ كود الخصم من هذه الصفحة، ثم اذهب إلى موقع المتجر وأضف المنتجات لسلة التسوق. عند الدفع، الصق الكود في خانة 'كود الخصم' أو 'Promo Code' للحصول على الخصم." },
                { question: "هل جميع الكوبونات مجربة وفعالة؟", answer: "نعم، فريقنا يختبر ويتحقق من كل كود خصم قبل نشره. نحرص على تقديم كوبونات فعالة ونقوم بإزالة الأكواد المنتهية بانتظام." },
                { question: "كم مرة يتم تحديث الكوبونات؟", answer: "نقوم بتحديث الكوبونات يومياً وأحياناً عدة مرات في اليوم لضمان حصولك على أحدث العروض والأكواد الفعالة." },
                { question: "هل يمكنني استخدام أكثر من كود خصم؟", answer: "عادةً يسمح كل متجر باستخدام كود خصم واحد فقط لكل طلب. لكن يمكنك الاستفادة من العروض والتخفيضات إلى جانب كود الخصم." },
            ],
            en: [
                { question: "What is the best coupon code available today?", answer: "We update this page daily with the best available discount codes. Coupons are sorted by popularity and rating, so the first code in the list is usually the best." },
                { question: "How do I use a coupon code?", answer: "Copy the coupon code from this page, then go to the store's website and add products to your cart. At checkout, paste the code in the 'coupon code' or 'promo code' field to get the discount." },
                { question: "Are all coupons verified and working?", answer: "Yes, our team tests and verifies every coupon code before publishing. We make sure to provide working coupons and regularly remove expired codes." },
                { question: "How often are the coupons updated?", answer: "We update coupons daily and sometimes multiple times a day to ensure you get the latest working deals and codes." },
                { question: "Can I use more than one coupon code?", answer: "Usually each store allows only one coupon code per order. However, you can combine ongoing sales and promotions with a coupon code." },
            ],
        },
    },

    // ─── Today Deals ─────────────────────────────────────────────────────────
    {
        slug: "today-deals",
        filter: (coupons) => {
            const d = today();
            return coupons
                .filter(c => c.isActive !== false && (!c.expiryDate || c.expiryDate >= d) && c.type === "deal")
                .sort((a, b) => (b.votesUp - b.votesDown) - (a.votesUp - a.votesDown))
                .slice(0, 30);
        },
        seo: {
            ar: {
                title: (c, y) => `عروض اليوم ${c} ${y} | خصومات حصرية لفترة محدودة`,
                description: (c) => `تصفح أحدث عروض وتخفيضات اليوم في ${c}. صفقات حصرية من أشهر المتاجر بدون الحاجة لكود خصم. احصل على أفضل الأسعار الآن.`,
            },
            en: {
                title: (c, y) => `Today's Deals ${c} ${y} – Exclusive Limited-Time Discounts`,
                description: (c) => `Browse today's latest deals and discounts in ${c}. Exclusive offers from top stores — no coupon code needed. Get the best prices now.`,
            },
        },
        content: {
            ar: {
                h1: (c) => `عروض وتخفيضات اليوم في ${c}`,
                intro: (c) => `اكتشف أحدث العروض والتخفيضات المتاحة اليوم في ${c}. نجمع لك أفضل الصفقات من أشهر المتاجر الإلكترونية التي يمكنك الاستفادة منها مباشرة بدون الحاجة لكود خصم. هذه العروض محدودة الوقت ومتجددة يومياً، فلا تفوّت فرصة الحصول على أفضل الأسعار على الإلكترونيات والأزياء ومنتجات التجميل والمزيد. تصفح القائمة المحدثة واستمتع بأقوى التخفيضات المتاحة حالياً.`,
            },
            en: {
                h1: (c) => `Today's Best Deals & Discounts in ${c}`,
                intro: (c) => `Discover the latest deals and discounts available today in ${c}. We gather the best offers from top online stores that you can take advantage of directly without needing a coupon code. These are limited-time deals updated daily, so don't miss out on getting the best prices on electronics, fashion, beauty products, and more. Browse the updated list and enjoy the best discounts currently available.`,
            },
        },
        faqs: {
            ar: [
                { question: "ما الفرق بين العروض والكوبونات؟", answer: "العروض هي تخفيضات مباشرة يقدمها المتجر على منتجات محددة بدون الحاجة لكود خصم. بينما الكوبونات تحتاج لنسخ ولصق كود معين عند الدفع." },
                { question: "هل عروض اليوم متاحة لفترة محدودة؟", answer: "نعم، معظم عروض اليوم محدودة الوقت وقد تنتهي في أي وقت. ننصحك بالاستفادة منها فوراً قبل انتهائها." },
                { question: "كيف أحصل على عرض اليوم؟", answer: "ببساطة اضغط على زر 'تفعيل العرض' بجانب العرض المناسب وسيتم توجيهك لصفحة العرض مباشرة في المتجر." },
                { question: "هل يمكنني استخدام كود خصم مع عروض اليوم؟", answer: "في بعض الحالات نعم! يمكنك تجربة إضافة كود خصم إلى جانب عرض اليوم للحصول على خصم إضافي." },
            ],
            en: [
                { question: "What's the difference between deals and coupons?", answer: "Deals are direct discounts offered by the store on specific products without needing a code. Coupons require you to copy and paste a specific code at checkout." },
                { question: "Are today's deals available for a limited time?", answer: "Yes, most daily deals are time-limited and may end anytime. We recommend taking advantage of them immediately before they expire." },
                { question: "How do I get today's deal?", answer: "Simply click the 'Activate Deal' button next to the deal you want, and you'll be redirected to the deal page directly on the store's website." },
                { question: "Can I use a coupon code with today's deals?", answer: "In some cases, yes! You can try adding a coupon code alongside a daily deal for additional savings." },
            ],
        },
    },

    // ─── New Coupons ─────────────────────────────────────────────────────────
    {
        slug: "new-coupons",
        filter: (coupons) => {
            const d = today();
            return coupons
                .filter(c => c.isActive !== false && (!c.expiryDate || c.expiryDate >= d))
                .slice(0, 30);  // Firestore docs are naturally ordered by creation time (ID)
        },
        seo: {
            ar: {
                title: (c, y) => `أحدث كوبونات وأكواد خصم ${c} ${y} | كوبونات جديدة اليوم`,
                description: (c) => `اكتشف أحدث كوبونات وأكواد الخصم المضافة حديثاً في ${c}. كوبونات جديدة يومياً من أشهر المتاجر. كن أول من يستفيد من العروض الجديدة.`,
            },
            en: {
                title: (c, y) => `New Coupon Codes ${c} ${y} – Fresh Deals Added Today`,
                description: (c) => `Discover the newest coupon codes recently added in ${c}. Fresh coupons daily from top stores. Be the first to use the latest deals.`,
            },
        },
        content: {
            ar: {
                h1: (c) => `أحدث كوبونات وأكواد الخصم في ${c}`,
                intro: (c) => `تصفح أحدث الكوبونات وأكواد الخصم المضافة حديثاً في ${c}. نحرص على إضافة كوبونات جديدة يومياً من أشهر المتاجر الإلكترونية لنضمن لك الوصول لأحدث العروض قبل أي أحد. هذه الصفحة تعرض الكوبونات مرتبة من الأحدث إلى الأقدم، مما يساعدك على اكتشاف الأكواد الطازجة فور إضافتها. لا تنسَ زيارة هذه الصفحة بانتظام لتبقى على اطلاع بأحدث أكواد الخصم.`,
            },
            en: {
                h1: (c) => `Latest Coupon Codes & Deals in ${c}`,
                intro: (c) => `Browse the latest coupons and discount codes recently added in ${c}. We add new coupons daily from the most popular online stores to ensure you get access to the latest deals before anyone else. This page displays coupons sorted from newest to oldest, helping you discover fresh codes as soon as they're added. Don't forget to visit this page regularly to stay updated with the latest discount codes.`,
            },
        },
        faqs: {
            ar: [
                { question: "كم مرة تضيفون كوبونات جديدة؟", answer: "نقوم بإضافة كوبونات جديدة يومياً وأحياناً عدة مرات في اليوم. نتابع أحدث العروض من المتاجر ونضيفها فور توفرها." },
                { question: "هل الكوبونات الجديدة أفضل من القديمة؟", answer: "ليس بالضرورة، لكن الكوبونات الجديدة غالباً ما تكون غير مستخدمة بكثرة وبالتالي فرصة نجاحها أعلى." },
                { question: "كيف أعرف إذا الكوبون جديد فعلاً؟", answer: "الكوبونات في هذه الصفحة مرتبة من الأحدث للأقدم. الكوبونات في أعلى القائمة هي المضافة مؤخراً." },
                { question: "هل يمكنني الاشتراك لتلقي إشعارات بالكوبونات الجديدة؟", answer: "نعم، يمكنك الاشتراك في النشرة البريدية الخاصة بنا من أسفل الصفحة لتلقي أحدث الكوبونات في بريدك الإلكتروني." },
            ],
            en: [
                { question: "How often do you add new coupons?", answer: "We add new coupons daily and sometimes multiple times a day. We follow the latest deals from stores and add them as soon as they become available." },
                { question: "Are new coupons better than older ones?", answer: "Not necessarily, but new coupons often haven't been widely used yet, so they may have a higher success rate." },
                { question: "How do I know if a coupon is actually new?", answer: "Coupons on this page are sorted from newest to oldest. The coupons at the top of the list are the most recently added." },
                { question: "Can I subscribe to get notifications for new coupons?", answer: "Yes, you can subscribe to our newsletter at the bottom of the page to receive the latest coupons in your email." },
            ],
        },
    },

    // ─── No Code Needed ──────────────────────────────────────────────────────
    {
        slug: "no-code-needed",
        filter: (coupons) => {
            const d = today();
            return coupons
                .filter(c => c.isActive !== false && (!c.expiryDate || c.expiryDate >= d) && !c.code)
                .sort((a, b) => (b.votesUp - b.votesDown) - (a.votesUp - a.votesDown))
                .slice(0, 30);
        },
        seo: {
            ar: {
                title: (c, y) => `عروض بدون كود خصم ${c} ${y} | خصومات مباشرة حتى 50%`,
                description: (c) => `تصفح أفضل العروض والتخفيضات في ${c} التي لا تحتاج لكود خصم. خصومات مباشرة من أشهر المتاجر — فقط اضغط وتسوق.`,
            },
            en: {
                title: (c, y) => `No Code Needed Deals ${c} ${y} – Direct Discounts Up to 50% OFF`,
                description: (c) => `Browse the best deals and discounts in ${c} that don't require a coupon code. Direct discounts from top stores — just click and shop.`,
            },
        },
        content: {
            ar: {
                h1: (c) => `عروض وخصومات بدون كود في ${c}`,
                intro: (c) => `تبحث عن عروض وتخفيضات بدون الحاجة لنسخ أو لصق كود خصم؟ هذه الصفحة تجمع لك أفضل العروض المباشرة في ${c} من أشهر المتاجر الإلكترونية. كل ما عليك فعله هو الضغط على زر 'تفعيل العرض' والانتقال مباشرة لصفحة العرض في المتجر. هذه العروض مثالية لمن يريد توفير المال بسرعة وسهولة بدون أي خطوات إضافية. نقوم بتحديث قائمة العروض يومياً لتقديم أحدث التخفيضات.`,
            },
            en: {
                h1: (c) => `No Code Needed — Direct Discounts in ${c}`,
                intro: (c) => `Looking for deals and discounts without the hassle of copying and pasting coupon codes? This page brings you the best direct deals in ${c} from top online stores. All you need to do is click the 'Activate Deal' button and go directly to the deal page. These offers are perfect for anyone who wants to save money quickly and easily without any extra steps. We update the deals list daily to provide you with the latest discounts.`,
            },
        },
        faqs: {
            ar: [
                { question: "لماذا لا تحتاج هذه العروض لكود خصم؟", answer: "هذه العروض هي تخفيضات مباشرة يقدمها المتجر على منتجات أو فئات معينة. الخصم يُطبق تلقائياً عند الشراء من خلال رابط العرض." },
                { question: "هل العروض بدون كود أقل خصماً؟", answer: "ليس بالضرورة. كثير من العروض المباشرة تقدم خصومات كبيرة قد تصل لأكثر من 50%. المهم هو مقارنة العروض واختيار الأفضل." },
                { question: "كيف أتأكد أن العرض فعال؟", answer: "جميع العروض في هذه الصفحة يتم التحقق منها بانتظام من قبل فريقنا. إذا وجدت عرضاً غير فعال، يمكنك إبلاغنا وسنقوم بإزالته فوراً." },
                { question: "هل يمكنني إضافة كود خصم مع عرض مباشر؟", answer: "في كثير من المتاجر، نعم! يمكنك الاستفادة من العرض المباشر ومحاولة إضافة كود خصم إضافي عند الدفع للحصول على توفير أكبر." },
            ],
            en: [
                { question: "Why don't these deals need a coupon code?", answer: "These are direct discounts offered by stores on specific products or categories. The discount is applied automatically when you purchase through the deal link." },
                { question: "Are no-code deals lesser discounts?", answer: "Not necessarily. Many direct offers provide big discounts that can exceed 50%. The key is comparing deals and choosing the best one." },
                { question: "How do I make sure the deal is active?", answer: "All deals on this page are regularly verified by our team. If you find an inactive deal, you can report it and we'll remove it immediately." },
                { question: "Can I add a coupon code with a direct deal?", answer: "In many stores, yes! You can take advantage of the direct deal and try adding an additional coupon code at checkout for extra savings." },
            ],
        },
    },
];

/**
 * Find a landing page definition by slug
 */
export function getLandingPageBySlug(slug: string): LandingPageDef | undefined {
    return LANDING_PAGES.find(p => p.slug === slug);
}

/**
 * All landing page slugs (for generateStaticParams, sitemap, etc.)
 */
export const LANDING_PAGE_SLUGS = LANDING_PAGES.map(p => p.slug);
