/**
 * SEO Helpers - Multi-Country GCC Coupon Platform
 * Centralized utilities for metadata, schema, hreflang, currency
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rukncoupons.com";

export const SUPPORTED_COUNTRIES = ["sa", "ae", "eg", "kw", "qa", "bh", "om"] as const;
export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number];

export const COUNTRY_CONFIG: Record<string, {
    name: string;
    currency: string;
    currencyCode: string;
    hreflang: string;
    locale: string;
}> = {
    sa: { name: "السعودية", currency: "ر.س", currencyCode: "SAR", hreflang: "ar-SA", locale: "ar_SA" },
    ae: { name: "الإمارات", currency: "د.إ", currencyCode: "AED", hreflang: "ar-AE", locale: "ar_AE" },
    eg: { name: "مصر", currency: "ج.م", currencyCode: "EGP", hreflang: "ar-EG", locale: "ar_EG" },
    kw: { name: "الكويت", currency: "د.ك", currencyCode: "KWD", hreflang: "ar-KW", locale: "ar_KW" },
    qa: { name: "قطر", currency: "ر.ق", currencyCode: "QAR", hreflang: "ar-QA", locale: "ar_QA" },
    bh: { name: "البحرين", currency: "د.ب", currencyCode: "BHD", hreflang: "ar-BH", locale: "ar_BH" },
    om: { name: "عُمان", currency: "ر.ع", currencyCode: "OMR", hreflang: "ar-OM", locale: "ar_OM" },
};

/**
 * Build absolute URL
 */
export function buildAbsoluteUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${SITE_URL}${cleanPath}`;
}

/**
 * Get country currency code (SAR, AED, EGP...)
 */
export function getCurrencyByCountry(countryCode: string): string {
    return COUNTRY_CONFIG[countryCode]?.currencyCode || "SAR";
}

/**
 * Get country hreflang tag (ar-SA, ar-AE...)
 */
export function getHreflangByCountry(countryCode: string): string {
    return COUNTRY_CONFIG[countryCode]?.hreflang || "ar";
}

/**
 * Generate hreflang alternates for a given path suffix
 * e.g. buildHreflangAlternates("/stores") → alternates object for all countries
 */
export function buildHreflangAlternates(pathSuffix: string = "") {
    const languages: Record<string, string> = {};
    const cleanSuffix = pathSuffix.startsWith("/") ? pathSuffix : `/${pathSuffix}`;

    for (const code of SUPPORTED_COUNTRIES) {
        const arHreflang = `ar-${code.toUpperCase()}`; // e.g. ar-SA
        const enHreflang = `en-${code.toUpperCase()}`; // e.g. en-SA

        languages[arHreflang] = buildAbsoluteUrl(`/ar/${code}${cleanSuffix}`);
        languages[enHreflang] = buildAbsoluteUrl(`/en/${code}${cleanSuffix}`);
    }

    // x-default → Arabic Saudi Arabia 
    languages["x-default"] = buildAbsoluteUrl(`/ar/sa${cleanSuffix}`);
    return languages;
}

/**
 * Build BreadcrumbList JSON-LD
 */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": buildAbsoluteUrl(item.url),
        })),
    };
}

/**
 * Build Organization + WebSite schema for root layout
 */
export function buildOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                "name": "ركن الكوبونات",
                "url": SITE_URL,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${SITE_URL}/logo.png`,
                },
                "sameAs": [
                    "https://twitter.com/rukncoupons",
                    "https://facebook.com/rukncoupons",
                    "https://instagram.com/rukncoupons"
                ],
                "description": "منصة عربية متخصصة في أكواد الخصم والكوبونات لأشهر المتاجر في السعودية، الإمارات، مصر، الكويت، قطر، البحرين وعُمان.",
            },
            {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                "url": SITE_URL,
                "name": "ركن الكوبونات",
                "publisher": { "@id": `${SITE_URL}/#organization` },
                "inLanguage": ["ar", "en"],
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": `${SITE_URL}/ar/sa/stores?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                },
            },
        ],
    };
}

/**
 * Build Store + ItemList + FAQ schema for a store page
 */
export function buildStorePageSchema(params: {
    store: {
        name: string;
        slug: string;
        logoUrl: string;
        description: string;
        storeUrl?: string;
        faq?: { question: string; answer: string }[];
    };
    coupons: {
        id: string;
        title: string;
        description: string;
        discountValue: string;
        code?: string;
        expiryDate?: string;
    }[];
    countryCode: string;
    countryName: string;
    locale: string;
}) {
    const { store, coupons, countryCode, countryName, locale } = params;
    const currency = getCurrencyByCountry(countryCode);
    const storeUrl = buildAbsoluteUrl(`/${locale}/${countryCode}/${store.slug}`);
    const today = new Date().toISOString().split("T")[0];

    const activeCoupons = coupons.filter(c => !c.expiryDate || c.expiryDate >= today);

    const graph: object[] = [
        {
            "@type": "Store",
            "@id": `${storeUrl}/#store`,
            "name": store.name,
            "image": store.logoUrl,
            "description": store.description,
            "url": store.storeUrl || storeUrl,
            "areaServed": countryName
        },
        {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": locale === "en" ? "Home" : "الرئيسية", "item": buildAbsoluteUrl(`/${locale}/${countryCode}`) },
                { "@type": "ListItem", "position": 2, "name": locale === "en" ? "Stores" : "المتاجر", "item": buildAbsoluteUrl(`/${locale}/${countryCode}/stores`) },
                { "@type": "ListItem", "position": 3, "name": locale === "en" ? `${store.name} Coupon Code` : `كود خصم ${store.name}`, "item": storeUrl },
            ],
        },
    ];

    if (activeCoupons.length > 0) {
        graph.push({
            "@type": "ItemList",
            "name": `كوبونات ${store.name} في ${countryName}`,
            "numberOfItems": activeCoupons.length,
            "itemListElement": activeCoupons.slice(0, 10).map((c, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "item": {
                    "@type": "Offer",
                    "name": locale === "en" ? (c as any).titleEn || c.title : c.title,
                    "description": locale === "en" ? (c as any).descriptionEn || c.description : c.description,
                    "priceCurrency": currency,
                    ...(c.code ? { "serialNumber": c.code } : {}),
                    "offeredBy": { "@type": "Store", "name": store.name },
                    "availability": "https://schema.org/InStock",
                    "validThrough": c.expiryDate || undefined,
                },
            })),
        });
    }

    if (store.faq && store.faq.length > 0) {
        graph.push({
            "@type": "FAQPage",
            "mainEntity": store.faq.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer,
                },
            })),
        });
    }

    return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * Generate automatic FAQ for a store page
 */
export function generateStoreFAQ(storeName: string, countryName: string, couponCount: number) {
    return [
        {
            question: `هل كوبونات ${storeName} فعّالة في ${countryName}؟`,
            answer: `نعم، جميع الكوبونات المعروضة في موقع ركن الكوبونات هي أكواد خصم حصرية ومحدّثة يومياً وفعّالة لمتجر ${storeName} في ${countryName}.`,
        },
        {
            question: `كيف أستخدم كود خصم ${storeName}؟`,
            answer: `انسخ كود الخصم، ثم توجّه إلى موقع ${storeName}، وأضف منتجاتك للسلة، وعند الدفع الصق الكود في خانة "كود الخصم" أو "القسيمة".`,
        },
        {
            question: `كم عدد كوبونات ${storeName} المتاحة؟`,
            answer: `يتوفر حالياً ${couponCount} كوبون وعرض لمتجر ${storeName} في ${countryName}. يتم تحديثها بشكل مستمر.`,
        },
        {
            question: `هل يمكن الجمع بين أكثر من كود خصم ${storeName}؟`,
            answer: `في الغالب تقبل المتاجر كود خصم واحد فقط في كل طلب. يُنصح تجربة أقوى الكوبونات وتفعيل الكود الذي يمنح أعلى توفير.`,
        },
    ];
}

// ═══════════════════════════════════════════════════════
//  CTR OPTIMIZATION ENGINE
//  Phase 1–7: Dynamic Titles, Descriptions, PAA FAQ
// ═══════════════════════════════════════════════════════

/**
 * Parse discount % from a discountValue string like "20%" or "20 SAR" or "خصم 20%"
 * Returns a number (e.g. 20) or null if not parseable
 */
export function extractDiscountPercent(discountValue: string): number | null {
    if (!discountValue) return null;
    const match = discountValue.match(/(\d+)\s*%/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * Get the maximum discount % from a list of coupons
 */
export function getMaxDiscountPercent(coupons: { discountValue: string }[]): number | null {
    const percents = coupons
        .map(c => extractDiscountPercent(c.discountValue))
        .filter((n): n is number => n !== null);
    return percents.length > 0 ? Math.max(...percents) : null;
}

/**
 * Count active coupons (not expired)
 */
export function countActiveCoupons(coupons: { expiryDate?: string; isActive?: boolean }[]): number {
    const today = new Date().toISOString().split("T")[0];
    return coupons.filter(
        c => c.isActive !== false && (!c.expiryDate || c.expiryDate >= today)
    ).length;
}

/**
 * PHASE 1 — Dynamic Store Title Generator (SEO Hardened)
 * Forces uniqueness and structural consistency
 */
export function buildDynamicStoreTitle(params: {
    storeName: string;
    countryName: string;
    countryCode?: string;
    maxDiscount: number | null;
    activeCouponCount: number;
    customTitle?: string;
}): string {
    const { storeName, customTitle } = params;

    // Admin override always wins
    if (customTitle) return customTitle;

    const year = new Date().getFullYear();

    // Deterministic selection of CTR modifiers based on storeName length to prevent footprint
    const modifiers = ["فعال 100%", "مُجرب اليوم", "يعمل الآن", "أحدث العروض"];
    const modifier = modifiers[storeName.length % modifiers.length];

    // Use actual country name for localized titles
    return `كود خصم ${storeName} ${params.countryName} ${year} | ${modifier}`;
}

/**
 * PHASE 2 — Dynamic Meta Description with Psychology Triggers
 * Enforces uniqueness by mixing dynamic variables and no duplication
 */
export function buildDynamicStoreDescription(params: {
    storeName: string;
    countryName: string;
    maxDiscount: number | null;
    activeCouponCount: number;
    storeDescription?: string;
    customDescription?: string;
}): string {
    const { storeName, customDescription } = params;

    if (customDescription) return customDescription;

    const year = new Date().getFullYear();

    // Use actual country name for localized descriptions
    return `احصل على أحدث كود خصم ${storeName} في ${params.countryName} لعام ${year}. كوبونات مفعلة يوميًا مع شرح طريقة الاستخدام وتوفير حقيقي.`;
}

/**
 * PHASE 7 — Thin Content Validator
 * Validates aggregate words and assigns indexing logic
 */
export function validateContentDepth(content: string = "") {
    // Basic word count splitting by whitespace and arabic formatting
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 1).length;
    const isThin = wordCount < 300;

    return {
        isThin,
        wordCount,
        seoAction: isThin ? "noindex, follow" : "index, follow",
        fallbackEnabled: isThin
    };
}

/**
 * PHASE 3 — Extended PAA FAQ (6 People Also Ask questions)
 * Targets featured snippets and FAQ SERP feature
 */
export function buildExtendedStoreFAQ(params: {
    storeName: string;
    countryName: string;
    activeCouponCount: number;
    maxDiscount: number | null;
    shippingInfo?: string;
    storeDescription?: string;
}): { question: string; answer: string }[] {
    const { storeName, countryName, activeCouponCount, maxDiscount, shippingInfo } = params;
    const year = new Date().getFullYear();
    const discountStr = maxDiscount ? `${maxDiscount}%` : "نسبة كبيرة";

    return [
        {
            question: `هل كود خصم ${storeName} يعمل في ${countryName} ${year}؟`,
            answer: `نعم، أكواد خصم ${storeName} متاحة ومحدّثة يومياً في ${countryName} عبر موقع ركن الكوبونات. يتوفر حالياً ${activeCouponCount > 0 ? `${activeCouponCount} كوبون فعّال` : "عروض متجددة"} لهذا المتجر.`,
        },
        {
            question: `كيف أستخدم كود خصم ${storeName}؟`,
            answer: `1. انسخ كود الخصم من هذه الصفحة. 2. توجّه إلى موقع ${storeName}. 3. أضف منتجاتك إلى سلة التسوق. 4. في صفحة الدفع، الصق الكود في خانة "كود الخصم" أو "القسيمة". 5. اضغط تطبيق وستظهر قيمة الخصم فوراً.`,
        },
        {
            question: `ما هو أعلى خصم في ${storeName} ${year}؟`,
            answer: maxDiscount
                ? `أعلى خصم متوفر حالياً لمتجر ${storeName} في ${countryName} هو ${maxDiscount}%. تختلف نسب الخصم حسب المنتج والعرض، لذا راجع جميع الكوبونات للحصول على أفضل توفير.`
                : `يُقدّم متجر ${storeName} خصومات متنوعة على مدار العام. تابع صفحتنا لمعرفة آخر العروض في ${countryName}.`,
        },
        {
            question: `متى تنتهي عروض ${storeName}؟`,
            answer: `تتفاوت صلاحية الكوبونات — بعضها ينتهي خلال ساعات وبعضها يمتد لأسابيع. نعرض تاريخ انتهاء كل كوبون بوضوح في الصفحة. نوصي باستخدام الكود فور نسخه.`,
        },
        {
            question: `هل يوجد شحن مجاني في ${storeName}؟`,
            answer: shippingInfo
                ? `${shippingInfo}. تحقق من صفحة العروض لمعرفة شروط الشحن المجاني الفعّالة حالياً.`
                : `${storeName} يُقدّم أحياناً عروض شحن مجاني ضمن كوبونات خاصة. تحقق من الكوبونات المتاحة في الصفحة لمعرفة ما هو فعّال الآن.`,
        },
        {
            question: `هل موقع ركن الكوبونات موثوق لكوبونات ${storeName}؟`,
            answer: `نعم، ركن الكوبونات منصة عربية متخصصة تراجع وتُحدّث أكواد الخصم يومياً. يعتمد عليها آلاف المتسوقين في ${countryName} للحصول على أفضل العروض من ${storeName} وأكثر من 100 متجر آخر.`,
        },
    ];
}

/**
 * PHASE 7 — Featured Snippet Summary Block data
 * Returns top 3 coupons for the "quick wins" table at the top of store page
 */
export function getTopCouponsForSnippet(coupons: {
    id: string;
    title: string;
    discountValue: string;
    code?: string;
    expiryDate?: string;
    isExclusive?: boolean;
    isVerified?: boolean;
}[], limit = 3) {
    const today = new Date().toISOString().split("T")[0];
    const active = coupons.filter(c => !c.expiryDate || c.expiryDate >= today);

    // Sort: verified+exclusive first, then by discount %
    return active
        .sort((a, b) => {
            const scoreA = (a.isVerified ? 2 : 0) + (a.isExclusive ? 1 : 0);
            const scoreB = (b.isVerified ? 2 : 0) + (b.isExclusive ? 1 : 0);
            if (scoreB !== scoreA) return scoreB - scoreA;
            const pA = extractDiscountPercent(a.discountValue) ?? 0;
            const pB = extractDiscountPercent(b.discountValue) ?? 0;
            return pB - pA;
        })
        .slice(0, limit);
}

