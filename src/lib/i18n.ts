/**
 * i18n — Centralized Locale Dictionary
 * Supports: Arabic (ar) and English (en)
 */

export type Locale = "ar" | "en";

export const SUPPORTED_LOCALES: Locale[] = ["ar", "en"];
export const DEFAULT_LOCALE: Locale = "ar";

export function isValidLocale(locale: string): locale is Locale {
    return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Country names by locale
 */
export const COUNTRY_NAMES: Record<Locale, Record<string, string>> = {
    ar: {
        sa: "السعودية",
        ae: "الإمارات",
        eg: "مصر",
        kw: "الكويت",
        qa: "قطر",
        bh: "البحرين",
        om: "عُمان",
    },
    en: {
        sa: "Saudi Arabia",
        ae: "UAE",
        eg: "Egypt",
        kw: "Kuwait",
        qa: "Qatar",
        bh: "Bahrain",
        om: "Oman",
    },
};

export function getCountryName(locale: Locale, countryCode: string): string {
    return COUNTRY_NAMES[locale]?.[countryCode] || COUNTRY_NAMES.ar[countryCode] || countryCode.toUpperCase();
}

/**
 * Main translations dictionary
 */
const translations: Record<Locale, Record<string, string>> = {
    ar: {
        // Site
        siteName: "ركن الكوبونات",
        siteDescription: "أحدث عروض المتاجر وأكواد الخصم",

        // Navigation
        home: "الرئيسية",
        stores: "المتاجر",
        coupons: "الكوبونات",
        blog: "المدونة",
        about: "عن الموقع",
        contact: "اتصل بنا",
        privacy: "سياسة الخصوصية",
        allStores: "جميع المتاجر",
        allCoupons: "جميع الكوبونات",
        viewAll: "عرض الكل",
        viewAllCoupons: "عرض جميع الكوبونات",
        popularStores: "🛍️ المتاجر الشائعة",
        latestCoupons: "أحدث الكوبونات",
        filterByCategory: "تصفح حسب التصنيف",
        all: "الكل",
        allCategories: "كل التصنيفات",
        allStoresFilter: "كل المتاجر",
        resultsCount: "كوبون متاح",

        // Coupon Card
        couponCode: "كوبون",
        specialOffer: "عرض خاص",
        exclusiveOffer: "حصري",
        deal: "صفقة",
        goToStore: "الذهاب للمتجر",
        copyCode: "نسخ",
        copied: "تم النسخ!",
        limitedTime: "فترة محدودة",
        verified: "مُتحقق",
        activeOffers: "عرض فعال",

        // Store page
        discountCode: "كود خصم",
        bestCoupons: "أفضل كوبونات",
        verifiedBy: "تم التحقق بواسطة: فريق التحرير",
        updatedOn: "تم التحديث في:",
        goToStoreLong: "الذهاب للمتجر",
        relatedStores: "متاجر مشابهة قد تهمك",
        faqTitle: "الأسئلة الشائعة حول",
        dontMiss: "لا تفوّت عروض",
        noActiveCoupons: "لا توجد كوبونات فعّالة",
        noActiveCouponsDesc: "لا توجد كوبونات فعّالة لمتجر {store} في {country} حالياً. نحن نراقب المتجر باستمرار ونضيف الكوبونات فور توفرها.",
        browsAllStores: "جميع المتاجر",
        topCouponsNow: "أفضل {count} كوبونات الآن",
        offer: "العرض",
        discount: "الخصم",
        code: "الكود",

        // Sidebar
        siteStats: "إحصائيات الموقع",
        storesCount: "عدد المتاجر",
        activeCoupons: "كوبونات فعالة",
        happyUsers: "مستخدمين سعداء",
        followUs: "تابعنا",
        recentArticles: "مقالات جديدة",

        // Footer
        quickLinks: "روابط سريعة",
        popularCategories: "أقسام مشهورة",
        newsletter: "اشترك في النشرة",
        newsletterDesc: "احصل على أحدث الكوبونات في بريدك.",
        subscribe: "اشتراك",
        emailPlaceholder: "بريدك الإلكتروني",
        subscribeSuccess: "تم الاشتراك بنجاح! 🎉",
        subscribeError: "حدث خطأ، يرجى المحاولة مجدداً.",
        invalidEmail: "يرجى إدخال بريد إلكتروني صحيح.",
        connectionError: "حدث خطأ في الاتصال، يرجى المحاولة مجدداً.",
        allRightsReserved: "موقع ركن الكوبونات. جميع الحقوق محفوظة.",
        adminPanel: "لوحة التحكم",
        footerDescription: "منصتك الأولى للحصول على أحدث كوبونات الخصم والعروض لأفضل المتاجر الإلكترونية في العالم العربي.",
        fashionCategory: "أزياء وموضة",
        electronicsCategory: "إلكترونيات",
        groceryCategory: "بقالة",

        // Search
        searchPlaceholder: "ابحث عن متجر أو ماركة...",

        // Blog
        blogTitle: "المدونة",
        shareArticle: "شارك الفائدة مع أصدقائك:",
        writtenBy: "كتب بواسطة:",
        expertTitle: "خبير تسوق وتوفير",
        tableOfContents: "📋 محتويات المقال:",
        faqSection: "الأسئلة الشائعة",
        recommendedCoupons: "🔥 كوبونات وعروض موصى بها",

        // Breadcrumbs
        breadcrumbHome: "الرئيسية",
        breadcrumbStores: "المتاجر",
        breadcrumbBlog: "المدونة",

        // 404
        notFoundTitle: "الصفحة غير موجودة",
        notFoundDesc: "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك العودة للصفحة الرئيسية أو تصفح المتاجر.",
        goHome: "الصفحة الرئيسية",
        browseStores: "تصفح المتاجر",

        // Empty states
        noCouponsInCategory: "لا توجد كوبونات في هذا التصنيف.",
        noResults: "لا توجد نتائج",
        noResultsDesc: "جرب تغيير خيارات التصفية للعثور على عروض أكثر.",
    },

    en: {
        // Site
        siteName: "Rukn Coupons",
        siteDescription: "Latest store deals and discount codes",

        // Navigation
        home: "Home",
        stores: "Stores",
        coupons: "Coupons",
        blog: "Blog",
        about: "About Us",
        contact: "Contact Us",
        privacy: "Privacy Policy",
        allStores: "All Stores",
        allCoupons: "All Coupons",
        viewAll: "View All",
        viewAllCoupons: "View All Coupons",
        popularStores: "🛍️ Popular Stores",
        latestCoupons: "Latest Coupons",
        filterByCategory: "Browse by Category",
        all: "All",
        allCategories: "All Categories",
        allStoresFilter: "All Stores",
        resultsCount: "coupons available",

        // Coupon Card
        couponCode: "Coupon",
        specialOffer: "Special Offer",
        exclusiveOffer: "Exclusive",
        deal: "Deal",
        goToStore: "Go to Store",
        copyCode: "Copy",
        copied: "Copied!",
        limitedTime: "Limited Time",
        verified: "Verified",
        activeOffers: "active offers",

        // Store page
        discountCode: "Coupon Code",
        bestCoupons: "Best Coupons for",
        verifiedBy: "Verified by: Editorial Team",
        updatedOn: "Updated on:",
        goToStoreLong: "Go to Store",
        relatedStores: "Related Stores You May Like",
        faqTitle: "Frequently Asked Questions about",
        dontMiss: "Don't Miss Deals from",
        noActiveCoupons: "No Active Coupons",
        noActiveCouponsDesc: "There are no active coupons for {store} in {country} right now. We monitor this store daily and add coupons as soon as they become available.",
        browsAllStores: "All Stores",
        topCouponsNow: "Top {count} Coupons Right Now",
        offer: "Offer",
        discount: "Discount",
        code: "Code",

        // Sidebar
        siteStats: "Site Statistics",
        storesCount: "Total Stores",
        activeCoupons: "Active Coupons",
        happyUsers: "Happy Users",
        followUs: "Follow Us",
        recentArticles: "Recent Articles",

        // Footer
        quickLinks: "Quick Links",
        popularCategories: "Popular Categories",
        newsletter: "Newsletter",
        newsletterDesc: "Get the latest coupons in your inbox.",
        subscribe: "Subscribe",
        emailPlaceholder: "Your email address",
        subscribeSuccess: "Subscribed successfully! 🎉",
        subscribeError: "An error occurred, please try again.",
        invalidEmail: "Please enter a valid email address.",
        connectionError: "Connection error, please try again.",
        allRightsReserved: "Rukn Coupons. All rights reserved.",
        adminPanel: "Admin Panel",
        footerDescription: "Your go-to platform for the latest discount codes and deals from the best online stores across the Middle East.",
        fashionCategory: "Fashion & Apparel",
        electronicsCategory: "Electronics",
        groceryCategory: "Grocery",

        // Search
        searchPlaceholder: "Search for a store or brand...",

        // Blog
        blogTitle: "Blog",
        shareArticle: "Share this article:",
        writtenBy: "Written by:",
        expertTitle: "Shopping & Savings Expert",
        tableOfContents: "📋 Table of Contents:",
        faqSection: "Frequently Asked Questions",
        recommendedCoupons: "🔥 Recommended Coupons & Deals",

        // Breadcrumbs
        breadcrumbHome: "Home",
        breadcrumbStores: "Stores",
        breadcrumbBlog: "Blog",

        // 404
        notFoundTitle: "Page Not Found",
        notFoundDesc: "Sorry, the page you're looking for doesn't exist or has been moved. You can go back to the homepage or browse stores.",
        goHome: "Homepage",
        browseStores: "Browse Stores",

        // Empty states
        noCouponsInCategory: "No coupons in this category.",
        noResults: "No Results",
        noResultsDesc: "Try changing the filter options to find more deals.",
    },
};

/**
 * Get a translated string by key
 */
export function t(locale: Locale, key: string): string {
    return translations[locale]?.[key] || translations.ar[key] || key;
}

/**
 * Get direction for locale
 */
export function getDir(locale: Locale): "rtl" | "ltr" {
    return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Get HTML lang for locale
 */
export function getLang(locale: Locale): string {
    return locale === "ar" ? "ar" : "en";
}
