/**
 * CouponCardServer — ZERO JS Server Component
 * Replaces CouponCard.tsx (client) with pure HTML+CSS.
 * Uses CSS details/summary for code reveal (no JS needed).
 * Uses inline SVG to eliminate lucide-react from this component.
 */
import React from "react";
import Image from "next/image";
import { Coupon, Store } from "@/lib/types";
import Link from "next/link";
import CopyButton from "./CopyButton";
import CouponViewTracker from "./CouponViewTracker";
import { getStoreName, getCouponTitle, getCouponDescription, getCouponDiscountValue } from "@/lib/locale-content";

interface Props {
    coupon: Coupon;
    store?: Store | null;
    categoryName?: string;
    countryCode: string;
    locale?: string;
}

export default function CouponCardServer({ coupon, store, categoryName, countryCode, locale = "ar" }: Props) {
    const today = new Date().toISOString().split("T")[0];
    const isExpired = coupon.expiryDate && coupon.expiryDate < today;
    if (isExpired) return null;
    const isEn = locale === "en";
    const displayCategoryName = categoryName || (isEn ? "Special Offer" : "عرض خاص");

    // Urgency: expires within 3 days
    const expiresSoon = coupon.expiryDate ? (() => {
        const diff = Math.ceil((new Date(coupon.expiryDate!).getTime() - new Date(today).getTime()) / 86400000);
        return diff >= 0 && diff <= 3;
    })() : false;

    const storeHref = store ? `/${locale}/${countryCode}/${store.slug}` : "#";
    const displayStoreName = store ? getStoreName(locale, store) : "";
    const displayTitle = getCouponTitle(locale, coupon);
    const displayDescription = getCouponDescription(locale, coupon);
    const displayDiscount = getCouponDiscountValue(locale, coupon);

    return (
        <article
            className="bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-shadow duration-200 p-5 flex flex-col items-center text-center relative overflow-hidden h-full"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
            aria-label={isEn ? `Coupon ${displayStoreName}: ${displayTitle}` : `كوبون ${displayStoreName}: ${displayTitle}`}
        >
            <CouponViewTracker couponId={coupon.id} />
            {/* Exclusive badge — static HTML, no JS */}
            {coupon.isExclusive && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-2xl z-10">
                    {isEn ? "Exclusive" : "حصري"}
                </div>
            )}
            {coupon._ruleOverrides?.badge && (
                <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-br-2xl z-10">
                    {coupon._ruleOverrides.badge}
                </div>
            )}

            {/* Store logo — links to store page */}
            <Link href={storeHref} className="mb-3 block" tabIndex={-1} aria-hidden="true" aria-label={isEn ? `${displayStoreName} logo` : `صورة شعار متجر ${displayStoreName}`}>
                <div className="w-[84px] h-[84px] rounded-full border border-gray-100 shadow-sm bg-white overflow-hidden p-1 flex items-center justify-center mx-auto">
                    {store?.logoUrl ? (
                        <Image
                            src={store.logoUrl.trim()}
                            alt={displayStoreName || (isEn ? "Store" : "متجر")}
                            className="w-full h-full object-contain rounded-full"
                            loading="lazy"
                            width={84}
                            height={84}
                            sizes="84px"
                        />
                    ) : (
                        <span className="text-3xl">🛍️</span>
                    )}
                </div>
            </Link>

            {/* Store name + category */}
            <Link href={storeHref} className="font-bold text-gray-900 text-sm mb-1 hover:text-blue-600 transition-colors">
                {displayStoreName}
            </Link>
            {displayCategoryName && <p className="text-[10px] text-gray-500 font-medium mb-3">{displayCategoryName}</p>}

            {/* Discount badge */}
            <div className="w-full bg-blue-50 text-blue-600 rounded-xl py-2 px-4 mb-2">
                <span className="font-bold text-lg tracking-tight block" dir="ltr">
                    {displayDiscount}
                </span>
            </div>

            {/* Trust & Urgency badges */}
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                {coupon.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                        {isEn ? "Verified" : "متحقق منه"}
                    </span>
                )}
                {expiresSoon && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        {isEn ? "Expires Soon" : "ينتهي قريباً"}
                    </span>
                )}
            </div>

            {/* Title — always visible to Googlebot */}
            <p className="text-gray-600 text-xs font-medium leading-relaxed line-clamp-2 mb-4 px-1">
                {displayTitle}
            </p>

            {/* Action: code always visible, click to copy + store link below */}
            {coupon.code ? (
                <div className="w-full mt-auto space-y-2">
                    {/* Code display — always visible */}
                    <CopyButton
                        couponId={coupon.id}
                        code={coupon.code}
                        storeName={store?.name || ""}
                    />
                    {/* Store link — separate button */}
                    <a
                        href={coupon.affiliateLink || store?.storeUrl || storeHref}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="w-full font-bold py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center gap-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[44px]"
                        aria-label={isEn ? `Go to ${displayStoreName}` : `الذهاب إلى متجر ${displayStoreName}`}
                    >
                        <span>{isEn ? "Visit Store" : "الذهاب للمتجر"}</span>
                    </a>
                </div>
            ) : (
                /* Deal without code — plain <a> tag, zero JS */
                <a
                    href={coupon.affiliateLink || store?.storeUrl || storeHref}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="w-full font-bold py-3 rounded-xl shadow-lg bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center gap-2 text-sm mt-auto transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[48px]"
                    aria-label={isEn ? `Activate ${displayStoreName} deal` : `تفعيل عرض ${displayStoreName}`}
                >
                    <span>{isEn ? "Activate Deal" : "تفعيل العرض"}</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                </a>
            )}

            {/* Footer — expiry & country flags */}
            <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{coupon.expiryDate ? (isEn ? `Expires ${coupon.expiryDate}` : `ينتهي ${coupon.expiryDate}`) : (isEn ? "Limited time" : "لفترة محدودة")}</span>
                </div>
                {coupon.countryCodes && coupon.countryCodes.length > 0 && (
                    <div className="flex items-center gap-1">
                        {coupon.countryCodes.slice(0, 3).map((code) => (
                            <img
                                key={code}
                                src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${code}.svg`}
                                title={code}
                                className="w-3.5 h-3.5 rounded-full object-cover"
                                alt={code}
                                loading="lazy"
                                width={14}
                                height={14}
                            />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
