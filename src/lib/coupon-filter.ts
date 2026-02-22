import { Coupon, Store } from "./types";

/**
 * PHASE 7: CONTEXTUAL RELEVANCE FILTER
 * 
 * Strictly validates a Coupon before it is ever injected into a blog article.
 * Protects against expired listings, duplicate placement, country mismatches,
 * and missing store references.
 * 
 * Called server-side by `renderBlogContent` in page.tsx
 */
export interface CouponFilterOptions {
    countryCode: string;
    storeId: string;
    existingCouponIdsOnPage: string[];
}

export function isRelevantCoupon(coupon: Coupon, options: CouponFilterOptions): boolean {
    const { countryCode, storeId, existingCouponIdsOnPage } = options;
    const today = new Date().toISOString().split('T')[0];

    // 1. Coupon must belong to the correct store
    if (coupon.storeId !== storeId) {
        return false;
    }

    // 2. Coupon must be valid for this country
    if (!coupon.countryCodes.includes(countryCode)) {
        return false;
    }

    // 3. Coupon must not be expired
    if (coupon.expiryDate && coupon.expiryDate < today) {
        return false;
    }

    // 4. Coupon must be active
    if (!coupon.isActive) {
        return false;
    }

    // 5. No duplicate coupons on the same page
    if (existingCouponIdsOnPage.includes(coupon.id)) {
        return false;
    }

    return true;
}

/**
 * Phase 7: Runs a full batch filter on all available coupons
 * Returns the top N relevant, ranked coupons for the given store and country
 */
export function filterAndRankCoupons(
    allCoupons: Coupon[],
    options: CouponFilterOptions,
    maxCoupons: number = 4
): Coupon[] {
    const filtered = allCoupons.filter(c => isRelevantCoupon(c, options));

    // Score each coupon: prioritize exclusive > highest discount % > most recent
    const scored = filtered.map(c => {
        let score = 0;
        if (c.type === 'coupon') score += 10;  // Prefer actual coupon codes
        const discountNum = parseFloat(c.discountValue) || 0;
        score += Math.min(discountNum, 50); // Discount value up to 50 pts
        if (c.title?.includes('حصري') || c.title?.includes('exclusive')) score += 5;
        return { coupon: c, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, maxCoupons)
        .map(s => s.coupon);
}
