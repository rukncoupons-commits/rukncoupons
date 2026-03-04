"use client";

import React from "react";
import Image from "next/image";
import { Coupon, Store, Category } from "@/lib/types";
import { Copy, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CouponCardProps {
    coupon: Coupon;
    store?: Store;
    categoryName?: string;
    onAction?: (coupon: Coupon) => void;
}

export default function CouponCard({ coupon, store, categoryName = "عرض خاص", onAction }: CouponCardProps) {
    const onActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (coupon.code) {
            navigator.clipboard.writeText(coupon.code);
        }

        if (onAction) {
            onAction(coupon);
        }
    };

    return (
        <div className="h-full group relative" onClick={onActionClick}>
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 p-5 h-full flex flex-col items-center text-center cursor-pointer relative overflow-hidden">

                {/* EXCLUSIVE BADGE */}
                {coupon.isExclusive && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-2xl shadow-sm z-10">
                        حصري
                    </div>
                )}

                {/* Custom Badge Override */}
                {coupon._ruleOverrides?.badge && (
                    <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-br-2xl shadow-sm z-10">
                        {coupon._ruleOverrides.badge}
                    </div>
                )}

                {/* LOGO */}
                <div className="w-[84px] h-[84px] mb-3 rounded-full border border-gray-100 shadow-sm bg-white overflow-hidden p-1 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    {store?.logoUrl ? (
                        <Image src={store.logoUrl?.trim()} alt={store.name || "متجر"} className="w-full h-full object-contain rounded-full" width={84} height={84} sizes="84px" loading="lazy" />
                    ) : (
                        <span className="text-3xl">🛍️</span>
                    )}
                </div>

                {/* Store Name & Category */}
                <h3 className="font-bold text-gray-900 text-sm mb-1">{store?.name}</h3>
                {categoryName && <p className="text-[10px] text-gray-500 font-medium mb-4">{categoryName}</p>}

                {/* DISCOUNT BADGE */}
                <div className="w-full bg-blue-50 text-blue-600 rounded-xl py-2 px-4 mb-4 transform transition-transform group-hover:scale-105">
                    <span className="font-bold text-lg tracking-tight block" dir="ltr">
                        {coupon.discountValue}
                    </span>
                </div>

                {/* Title */}
                <p className="text-gray-600 text-xs font-medium leading-relaxed line-clamp-2 mb-5 px-1">
                    {coupon.title}
                </p>

                {/* ACTION BUTTON */}
                <button
                    className={cn(
                        "w-full font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-white mt-auto text-sm",
                        coupon.code ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-gray-800 hover:bg-gray-900 shadow-gray-200"
                    )}
                >
                    {coupon.code ? (
                        <>
                            <span>نسخ الكود</span>
                            <Copy className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            <span>تفعيل العرض</span>
                            <Zap className="w-4 h-4" />
                        </>
                    )}
                </button>

                {/* FOOTER */}
                <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>لفترة محدودة</span>
                    </div>

                    <div className="flex items-center gap-1">
                        {coupon.countryCodes?.map((code) => (
                            <img
                                key={code}
                                src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${code}.svg`}
                                title={code}
                                className="w-3.5 h-3.5 rounded-full object-cover shadow-sm border border-gray-100"
                                alt={code}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
