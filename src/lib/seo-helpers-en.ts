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
    longTailKeyword?: string;
}): string {
    const { storeName, countryCode, maxDiscount, customTitle, longTailKeyword } = params;

    if (customTitle) return customTitle;

    const year = new Date().getFullYear();
    const country = getEnglishCountryName(countryCode);
    const keyword = longTailKeyword || "Coupon Code";

    // High CTR Pattern as requested: "{Store} {Country} {Keyword} {Year} – {MaxDiscount}% OFF + Free Shipping"
    // Using variations to avoid exact duplicates
    const patterns = [
        `${storeName} ${country} ${keyword} ${year} – ${maxDiscount ? `Up to ${maxDiscount}% OFF` : "Exclusive Offers"} + Free Shipping`,
        `${storeName} ${keyword} ${country} ${year} | ${maxDiscount ? `Save ${maxDiscount}%` : "Verified Working"} Today`,
        `${storeName} ${country} ${longTailKeyword || "Promo Code"} ${year} – 100% Working Deals`,
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
    longTailKeyword?: string;
}): string {
    const { storeName, countryCode, maxDiscount, activeCouponCount, customDescription, longTailKeyword } = params;

    if (customDescription) return customDescription;

    const country = getEnglishCountryName(countryCode);
    const kw1 = longTailKeyword || "coupon codes";
    const kw2 = longTailKeyword === "discount code" ? "promo codes" : "discount codes";
    const discountText = maxDiscount ? `Save up to ${maxDiscount}% FREE` : "Unlock exclusive savings";
    const countText = activeCouponCount > 0 ? `with ${activeCouponCount} verified` : "with tested";

    return `Get the latest ${storeName} ${kw1} in ${country}. ${discountText} ${countText} ${kw2}. Browse today's best ${storeName} deals and offers.`;
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
    longTailKeyword?: string;
}): string {
    const { storeName, countryCode, activeCouponCount, maxDiscount, storeDescription, longTailKeyword } = params;
    const country = getEnglishCountryName(countryCode);
    const keyword = longTailKeyword || "coupon code";
    const variations = longTailKeyword ? [longTailKeyword, "deals", "offers today"] : ["promo code", "discount code", "deals"];

    return `Save big with the latest ${storeName} ${country} ${keyword}s. Why pay full price when you can instantly unlock massive savings? Browse our daily-updated list of ${activeCouponCount > 0 ? `${activeCouponCount} verified` : "active"} ${storeName} ${variations[0]}s crafted specifically for shoppers in ${country}. ${maxDiscount ? `Grab up to ${maxDiscount}% OFF ` : "Get exclusive price drops "} on your entire cart today. Every ${storeName} ${variations[1]} you see here is manually tested by our team to guarantee it works. Don't miss out on ${storeName} ${variations[2]}—apply your code at checkout and enjoy free shipping on eligible orders.${storeDescription ? `\n\n**About ${storeName}:** ${storeDescription}` : ""}`;
}

/**
 * HOW TO USE — Step-by-step guide (60-120 words)
 */
export function buildEnglishHowToUse(storeName: string, longTailKeyword?: string): string {
    const keyword = longTailKeyword || "coupon code";
    return `Activating your ${storeName} ${keyword} takes just seconds. Step 1: Browse the active offers above and click "Copy" on the ${keyword} that gives the highest discount. Step 2: Shop on the official ${storeName} website and load up your cart. Step 3: Proceed to checkout and paste your copied ${keyword} directly into the "Promo Code" box. Hit "Apply" and watch your total price drop instantly!`;
}

/**
 * SAVING TIPS — Maximize savings section (60-120 words)
 */
export function buildEnglishSavingTips(storeName: string): string {
    return `Want to maximize your savings at ${storeName}? Start by bookmarking this page to catch daily flash sales and exclusive ${storeName} deals. Always stack a working promo code with seasonal clearance events like Black Friday or White Friday. Pro tip: Subscribe to ${storeName}'s newsletter for a potential first-order discount code, and look out for limited-time free shipping offers to stack on top of your percentage-off coupon.`;
}

/**
 * EXTENDED FAQ — 6 PAA-targeted questions for English search intent
 */
export function buildEnglishStoreFAQ(params: {
    storeName: string;
    countryCode: string;
    activeCouponCount: number;
    maxDiscount: number | null;
    longTailKeyword?: string;
}): { question: string; answer: string }[] {
    const { storeName, countryCode, activeCouponCount, maxDiscount, longTailKeyword } = params;
    const country = getEnglishCountryName(countryCode);
    const year = new Date().getFullYear();

    return [
        {
            question: `What is the best ${storeName} ${longTailKeyword || "coupon code"} for ${country}?`,
            answer: `The highest verified discount today offers ${maxDiscount ? `up to ${maxDiscount}% OFF` : "massive savings"}. We currently have ${activeCouponCount > 0 ? `${activeCouponCount} active` : "multiple"} ${storeName} promo codes tested and working. Check the top of this page for the #1 ranked code.`,
        },
        {
            question: `How do I redeem my ${storeName} promo code?`,
            answer: `Shop at ${storeName}, add products to your cart, and enter the copied code into the designated "Promo Code" or "Discount Code" field at checkout. Click Apply to instantly activate your deals.`,
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
