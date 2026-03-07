/**
 * SEO Helpers — English Locale
 * CTR-optimized title/description generators and FAQ for English coupon pages
 */

import { SITE_URL, SUPPORTED_COUNTRIES, extractDiscountPercent, getMaxDiscountPercent, countActiveCoupons } from "./seo-helpers";
import { getCountryName } from "./i18n";

/**
 * English country names for SEO
 */
const ENGLISH_COUNTRY_NAMES: Record<string, string> = {
    sa: "Saudi Arabia",
    ae: "UAE",
    eg: "Egypt",
    kw: "Kuwait",
    qa: "Qatar",
    bh: "Bahrain",
    om: "Oman",
};

export function getEnglishCountryName(countryCode: string): string {
    return ENGLISH_COUNTRY_NAMES[countryCode] || countryCode.toUpperCase();
}

/**
 * TITLE — CTR-Optimized English Store Page Title
 * Patterns from the user's SEO strategy
 */
export function buildEnglishStoreTitle(params: {
    storeName: string;
    countryCode: string;
    maxDiscount: number | null;
    activeCouponCount: number;
    customTitle?: string;
}): string {
    const { storeName, countryCode, maxDiscount, customTitle } = params;

    if (customTitle) return customTitle;

    const year = new Date().getFullYear();
    const country = getEnglishCountryName(countryCode);

    // Deterministic pattern selection
    const patterns = [
        `${storeName} Coupon Code ${country} ${year} – Verified & Working`,
        `${storeName} Promo Code ${country} ${year}${maxDiscount ? ` | Save ${maxDiscount}%` : " | Latest Deals"}`,
        `${storeName} Discount Code ${country} ${year} – Tested Today`,
        `Latest ${storeName} Coupon Codes ${country} ${year} | Exclusive Deals`,
    ];
    const index = storeName.length % patterns.length;
    return patterns[index];
}

/**
 * META DESCRIPTION — 140-160 chars with keyword, benefit, urgency, CTA
 */
export function buildEnglishStoreDescription(params: {
    storeName: string;
    countryCode: string;
    maxDiscount: number | null;
    activeCouponCount: number;
    customDescription?: string;
}): string {
    const { storeName, countryCode, maxDiscount, activeCouponCount, customDescription } = params;

    if (customDescription) return customDescription;

    const country = getEnglishCountryName(countryCode);
    const discountText = maxDiscount ? `Save up to ${maxDiscount}%` : "Save big";
    const couponText = activeCouponCount > 0 ? `${activeCouponCount} verified codes` : "verified codes";

    return `Get the latest ${storeName} coupon codes for ${country}. ${discountText} with ${couponText}. Tested & working promo codes updated daily.`;
}

/**
 * INTRO — 80-120 word natural introduction paragraph
 */
export function buildEnglishStoreIntro(params: {
    storeName: string;
    countryCode: string;
    activeCouponCount: number;
    maxDiscount: number | null;
    storeDescription?: string;
}): string {
    const { storeName, countryCode, activeCouponCount, maxDiscount, storeDescription } = params;
    const country = getEnglishCountryName(countryCode);
    const year = new Date().getFullYear();

    return `Looking for the latest ${storeName} coupon codes in ${country}? You've come to the right place. On this page, you'll find ${activeCouponCount > 0 ? `${activeCouponCount} verified` : "the latest"} ${storeName} promo codes, exclusive discounts, and the best deals available in ${year}. ${maxDiscount ? `Save up to ${maxDiscount}% on ` : "Save on "}your favorite products with our tested ${storeName} discount codes. All coupons are manually verified and updated daily to ensure they work.${storeDescription ? ` ${storeDescription}` : ""}`;
}

/**
 * HOW TO USE — Step-by-step guide (60-120 words)
 */
export function buildEnglishHowToUse(storeName: string): string {
    return `Using a ${storeName} coupon code is simple. First, browse the available codes on this page and click "Copy" on the one you want to use. Next, head to the ${storeName} website and add your desired items to the shopping cart. When you reach the checkout page, look for the "Promo Code" or "Coupon Code" input field. Paste your copied code and click "Apply." The discount will be reflected in your order total immediately. If one code doesn't work, try another — some codes have specific conditions or minimum purchase requirements.`;
}

/**
 * SAVING TIPS — Maximize savings section (60-120 words)
 */
export function buildEnglishSavingTips(storeName: string): string {
    return `To maximize your savings at ${storeName}, try these expert tips. First, always check this page before making a purchase — we update our codes daily. Second, compare multiple coupon codes to find the highest discount. Third, sign up for ${storeName}'s newsletter to get notified about flash sales and exclusive deals. Fourth, consider shopping during major sale events like Black Friday, Singles' Day, or end-of-season sales when ${storeName} typically offers their biggest discounts. Finally, check if ${storeName} offers a student discount or first-time buyer code for additional savings.`;
}

/**
 * EXTENDED FAQ — 6 PAA-targeted questions for English search intent
 */
export function buildEnglishStoreFAQ(params: {
    storeName: string;
    countryCode: string;
    activeCouponCount: number;
    maxDiscount: number | null;
}): { question: string; answer: string }[] {
    const { storeName, countryCode, activeCouponCount, maxDiscount } = params;
    const country = getEnglishCountryName(countryCode);
    const year = new Date().getFullYear();

    return [
        {
            question: `What is the latest ${storeName} coupon code for ${country}?`,
            answer: `We currently have ${activeCouponCount > 0 ? `${activeCouponCount} active` : "several"} ${storeName} coupon codes for ${country}. All codes are verified and updated daily. Check the list above for the latest working promo codes.`,
        },
        {
            question: `How do I use a ${storeName} promo code?`,
            answer: `Copy the code from this page, go to ${storeName}'s website, add items to your cart, and paste the code at checkout in the "Promo Code" or "Coupon Code" field. Click "Apply" and the discount will be applied instantly.`,
        },
        {
            question: `Does ${storeName} offer free shipping in ${country}?`,
            answer: `${storeName} occasionally offers free shipping promotions. Check our coupon list above for any active free shipping codes. Some codes may require a minimum purchase amount.`,
        },
        {
            question: `Can I combine multiple ${storeName} coupon codes?`,
            answer: `Most stores, including ${storeName}, only accept one coupon code per order. We recommend trying the highest-value code first. If it doesn't work, try the next one on the list.`,
        },
        {
            question: `How much can I save with ${storeName} coupons in ${year}?`,
            answer: maxDiscount
                ? `The best ${storeName} discount currently available is ${maxDiscount}% off. Savings vary by product and promotion. Check all available codes above to find the best deal for your order.`
                : `${storeName} offers various discounts throughout the year. Visit this page regularly to find the latest and best coupon codes for ${country}.`,
        },
        {
            question: `Are ${storeName} coupon codes on Rukn Coupons verified?`,
            answer: `Yes, all ${storeName} coupon codes listed on Rukn Coupons are manually tested and verified by our editorial team. We update codes daily and remove expired ones to ensure you always find working promo codes.`,
        },
    ];
}

/**
 * English homepage metadata
 */
export function buildEnglishHomeTitle(countryCode: string): string {
    const country = getEnglishCountryName(countryCode);
    const year = new Date().getFullYear();
    return `Best Coupon Codes & Promo Codes ${country} ${year} | Rukn Coupons`;
}

export function buildEnglishHomeDescription(countryCode: string): string {
    const country = getEnglishCountryName(countryCode);
    return `Find the latest coupon codes, promo codes, and discount deals for top stores in ${country}. Verified daily. Save on Noon, Amazon, Namshi, and more.`;
}

/**
 * English stores page metadata
 */
export function buildEnglishStoresTitle(countryCode: string): string {
    const country = getEnglishCountryName(countryCode);
    return `All Stores with Coupon Codes in ${country} | Rukn Coupons`;
}

export function buildEnglishStoresDescription(countryCode: string): string {
    const country = getEnglishCountryName(countryCode);
    return `Browse all stores with active coupon codes and promo codes in ${country}. Find verified discount codes for your favorite brands and save today.`;
}
