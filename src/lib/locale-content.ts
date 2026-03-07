/**
 * locale-content.ts — Locale-aware field selectors for dynamic Firestore content.
 *
 * Usage: pass the current locale and the document to get the correct field.
 * Falls back to Arabic when English content is missing.
 */

import type { Store, Coupon, Category } from "./types";

/**
 * Generic helper: returns English field if locale=en and field exists, else Arabic.
 */
export function loc(locale: string, ar: string, en?: string): string {
    return locale === "en" && en ? en : ar;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export function getStoreName(locale: string, store: Store): string {
    return loc(locale, store.name, store.nameEn);
}

export function getStoreDescription(locale: string, store: Store): string {
    return loc(locale, store.description, store.descriptionEn);
}

export function getStoreLongDescription(locale: string, store: Store): string {
    return loc(locale, store.longDescription, store.longDescriptionEn);
}

export function getStoreShippingInfo(locale: string, store: Store): string {
    return loc(locale, store.shippingInfo, store.shippingInfoEn);
}

export function getStoreReturnPolicy(locale: string, store: Store): string {
    return loc(locale, store.returnPolicy, store.returnPolicyEn);
}

// ─── Coupon ──────────────────────────────────────────────────────────────────

export function getCouponTitle(locale: string, coupon: Coupon): string {
    return loc(locale, coupon.title, coupon.titleEn);
}

export function getCouponDescription(locale: string, coupon: Coupon): string {
    return loc(locale, coupon.description, coupon.descriptionEn);
}

export function getCouponDiscountValue(locale: string, coupon: Coupon): string {
    return loc(locale, coupon.discountValue, coupon.discountValueEn);
}

// ─── Category ────────────────────────────────────────────────────────────────

export function getCategoryName(locale: string, category: Category): string {
    return loc(locale, category.name, category.nameEn);
}
