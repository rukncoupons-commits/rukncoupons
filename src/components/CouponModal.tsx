"use client";

import React, { useEffect, useState } from "react";
import { Coupon, Store } from "@/lib/types";
import { X, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CouponModalProps {
    coupon: Coupon | null;
    store: Store | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function CouponModal({ coupon, store, isOpen, onClose }: CouponModalProps) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && coupon?.code) {
            // Auto-copy code on open if requested by client (similar to old angular app)
            navigator.clipboard.writeText(coupon.code).catch(() => { });
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    }, [isOpen, coupon]);

    if (!isOpen || !coupon) return null;

    const handleCopy = () => {
        if (coupon.code) {
            navigator.clipboard.writeText(coupon.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handleGoToStore = () => {
        const url = coupon.affiliateLink || store?.storeUrl;
        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir="rtl">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header Ribbon */}
                <div className="h-4 bg-gradient-to-r from-blue-600 to-indigo-600 w-full" />

                <button
                    onClick={onClose}
                    className="absolute top-8 left-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center pt-10">

                    {/* Store Logo */}
                    <div className="w-24 h-24 mx-auto mb-6 bg-white border-4 border-slate-50 shadow-md rounded-full flex items-center justify-center p-2 relative">
                        {store?.logoUrl ? (
                            <img src={store.logoUrl} alt={store?.name} className="w-full h-full object-contain rounded-full" />
                        ) : (
                            <span className="text-4xl">🛍️</span>
                        )}
                    </div>

                    <h3 className="text-xl font-black text-slate-800 mb-2">
                        تم نسخ الكود بنجاح!
                    </h3>
                    <p className="text-slate-500 text-sm mb-8 px-4 leading-relaxed">
                        {coupon.title}
                    </p>

                    {/* Coupon Code Area */}
                    {coupon.code && (
                        <div className="mb-8">
                            <div
                                onClick={handleCopy}
                                className={cn(
                                    "relative group cursor-pointer w-full bg-slate-50 border-2 border-dashed py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-colors",
                                    copied ? "border-green-400 bg-green-50" : "border-blue-200 hover:border-blue-400"
                                )}
                            >
                                <span className={cn(
                                    "text-3xl font-black tracking-wider font-mono",
                                    copied ? "text-green-600" : "text-blue-600"
                                )}>
                                    {coupon.code}
                                </span>

                                <div className="absolute inset-y-0 left-4 flex items-center justify-center">
                                    {copied ? (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                                    )}
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-3">
                                {copied ? "استخدم هذا الكود عند الدفع" : "انقر لنسخ الكود مرة أخرى"}
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleGoToStore}
                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>الذهاب إلى المتجر</span>
                        <ExternalLink className="w-4 h-4" />
                    </button>

                </div>
            </div>
        </div>
    );
}
