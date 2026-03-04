"use client";

import React from "react";
import { Star, ExternalLink, ShieldCheck, Zap } from "lucide-react";

interface AffiliateProductCardProps {
    title: string;
    description: string;
    imageUrl: string;
    price?: string;
    oldPrice?: string;
    discountPercent?: number;
    rating: number; // e.g. 4.5
    reviewsCount: number;
    affiliateUrl: string;
    badge?: string; // e.g. "أفضل مبيعاً", "أرخص سعر"
}

export default function AffiliateProductCard({
    title,
    description,
    imageUrl,
    price,
    oldPrice,
    discountPercent,
    rating,
    reviewsCount,
    affiliateUrl,
    badge
}: AffiliateProductCardProps) {
    // Phase 9: Analytics Tracking Placeholder
    const trackClick = () => {
        console.log(`[Tracking] Amazon Outbound Click: ${title}`);
        if (typeof window !== "undefined" && (window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: "amazon_affiliate_click",
                product_name: title,
                destination_url: affiliateUrl
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-md transition-all h-full relative group">

            {/* Badges */}
            {badge && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-white" />
                    {badge}
                </div>
            )}
            {discountPercent && (
                <div className="absolute top-3 left-3 bg-green-500 text-white text-sm font-black w-12 h-12 flex items-center justify-center rounded-full z-10 shadow-sm transform -rotate-12 group-hover:scale-110 transition-transform">
                    {discountPercent}%
                </div>
            )}

            {/* Product Image */}
            <div className="h-48 bg-white p-4 flex items-center justify-center relative border-b border-gray-50">
                <img
                    src={imageUrl}
                    alt={title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                {/* Rating & Trust */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-amber-500" aria-label={`تقييم ${rating} من 5`}>
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-amber-500" : "fill-gray-200 text-gray-200"}`}
                            />
                        ))}
                        <span className="text-xs text-gray-500 font-bold mr-1">({reviewsCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3" />
                        موثوق
                    </div>
                </div>

                {/* Title & Desc */}
                <h3 className="font-black text-gray-800 text-lg mb-2 line-clamp-2 leading-tight">
                    {title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed flex-1">
                    {description}
                </p>

                {/* Pricing & CTA */}
                <div className="mt-auto border-t border-gray-50 pt-4">
                    {(price || oldPrice) && (
                        <div className="flex items-end gap-2 mb-3">
                            {price && <span className="text-2xl font-black text-red-600">{price}</span>}
                            {oldPrice && <span className="text-sm text-gray-400 line-through mb-1">{oldPrice}</span>}
                        </div>
                    )}

                    {/* Primary Commercial Intent Button */}
                    <a
                        href={affiliateUrl}
                        target="_blank"
                        rel="nofollow noopener sponsored"
                        onClick={trackClick}
                        className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        تحقق من السعر الآن على أمازون
                        <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}
