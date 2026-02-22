/**
 * CouponCardServer — ZERO JS Server Component
 * Replaces CouponCard.tsx (client) with pure HTML+CSS.
 * Uses CSS details/summary for code reveal (no JS needed).
 * Uses inline SVG to eliminate lucide-react from this component.
 */
import React from "react";
import { Coupon, Store } from "@/lib/types";
import CopyButton from "./CopyButton";
import Link from "next/link";
import CouponViewTracker from "./CouponViewTracker";

interface Props {
    coupon: Coupon;
    store?: Store | null;
    categoryName?: string;
    countryCode: string;
}

export default function CouponCardServer({ coupon, store, categoryName = "عرض خاص", countryCode }: Props) {
    const today = new Date().toISOString().split("T")[0];
    const isExpired = coupon.expiryDate && coupon.expiryDate < today;
    if (isExpired) return null; // Server-filter expired coupons — never sent to browser

    const storeHref = store ? `/${countryCode}/${store.slug}` : "#";

    return (
        <article
            className="bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-shadow duration-200 p-5 flex flex-col items-center text-center relative overflow-hidden h-full"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
            aria-label={`كوبون ${store?.name || ""}: ${coupon.title}`}
        >
            <CouponViewTracker couponId={coupon.id} />
            {/* Exclusive badge — static HTML, no JS */}
            {coupon.isExclusive && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-2xl z-10">
                    حصري
                </div>
            )}
            {coupon._ruleOverrides?.badge && (
                <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-br-2xl z-10">
                    {coupon._ruleOverrides.badge}
                </div>
            )}

            {/* Store logo — links to store page */}
            <Link href={storeHref} className="mb-3 block" tabIndex={-1} aria-hidden="true">
                <div className="w-[84px] h-[84px] rounded-full border border-gray-100 shadow-sm bg-white overflow-hidden p-1 flex items-center justify-center mx-auto">
                    {store?.logoUrl ? (
                        <img
                            src={store.logoUrl}
                            alt={store.name}
                            className="w-full h-full object-contain rounded-full"
                            loading="lazy"
                            width={84}
                            height={84}
                        />
                    ) : (
                        <span className="text-3xl">🛍️</span>
                    )}
                </div>
            </Link>

            {/* Store name + category */}
            <Link href={storeHref} className="font-bold text-gray-900 text-sm mb-1 hover:text-blue-600 transition-colors">
                {store?.name}
            </Link>
            {categoryName && <p className="text-[10px] text-gray-500 font-medium mb-3">{categoryName}</p>}

            {/* Discount badge */}
            <div className="w-full bg-blue-50 text-blue-600 rounded-xl py-2 px-4 mb-3">
                <span className="font-bold text-lg tracking-tight block" dir="ltr">
                    {coupon.discountValue}
                </span>
            </div>

            {/* Title — always visible to Googlebot */}
            <p className="text-gray-600 text-xs font-medium leading-relaxed line-clamp-2 mb-4 px-1">
                {coupon.title}
            </p>

            {/* Action: code reveal via details/summary (CSS only) OR direct deal button */}
            {coupon.code ? (
                <details className="w-full group mt-auto">
                    <summary className="w-full font-bold py-3 rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center justify-center gap-2 text-sm list-none select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[48px]">
                        <span>إظهار الكود</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    </summary>
                    {/* Revealed on click — CSS only, no JS for the reveal */}
                    <div className="mt-3 space-y-2">
                        {/* Code display */}
                        <div className="bg-gray-50 border-2 border-dashed border-blue-200 rounded-xl py-3 px-4">
                            <span className="font-mono font-black text-blue-700 text-base tracking-widest" dir="ltr">
                                {coupon.code}
                            </span>
                        </div>
                        {/* Copy button — only client island */}
                        <CopyButton
                            couponId={coupon.id}
                            code={coupon.code}
                            storeUrl={store?.storeUrl}
                            storeName={store?.name || ""}
                        />
                    </div>
                </details>
            ) : (
                /* Deal without code — plain <a> tag, zero JS */
                <a
                    href={store?.storeUrl || storeHref}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="w-full font-bold py-3 rounded-xl shadow-lg bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center gap-2 text-sm mt-auto transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[48px]"
                    aria-label={`تفعيل عرض ${store?.name}`}
                >
                    <span>تفعيل العرض</span>
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
                    <span>{coupon.expiryDate ? `ينتهي ${coupon.expiryDate}` : "لفترة محدودة"}</span>
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
