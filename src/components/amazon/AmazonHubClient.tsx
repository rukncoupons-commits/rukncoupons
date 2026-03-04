"use client";

import React, { useState, useEffect } from "react";
import AffiliateProductCard from "./AffiliateProductCard";
import { Copy, AlertCircle } from "lucide-react";

interface AmazonHubClientProps {
    countryName: string;
    amazonProducts: any[]; // Simulated products or fetched data
}

export default function AmazonHubClient({ countryName, amazonProducts }: AmazonHubClientProps) {
    const year = new Date().getFullYear();
    const [liveDate, setLiveDate] = useState("");

    useEffect(() => {
        // Phase 7: Freshness Signal (Live Client-side)
        setLiveDate(new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }, []);

    // Phase 4: Sticky CTA logic (Mobile)
    const [showSticky, setShowSticky] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setShowSticky(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filter deals securely
    const topDeals = amazonProducts.filter(p => p.badge === "أفضل مبيعاً" || p.discountPercent > 30).slice(0, 4);
    const trending = amazonProducts.filter(p => !topDeals.includes(p)).slice(0, 8);

    return (
        <div className="w-full" dir="rtl">
            {/* Phase 1: Custom Hero Section */}
            <div className="bg-gradient-to-l from-gray-900 via-gray-800 to-amber-900 rounded-3xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-xl border-4 border-white">
                <div className="absolute -left-20 -top-20 opacity-10 blur-3xl w-64 h-64 bg-amber-500 rounded-full"></div>
                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        تم التحديث اليوم: {liveDate}
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                        أفضل عروض <span className="text-amber-400">أمازون {countryName}</span> اليوم {year}
                    </h2>
                    <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
                        وفر مئات الريالات مع أقوى الصفقات والمنتجات الأعلى تقييماً على أمازون. لا تبحث عن كود خصم، الأسعار المخفضة تُطبق مباشرة عبر الروابط الموثوقة أدناه.
                    </p>
                </div>
            </div>

            {/* Warning Alert against fake coupons */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-10 flex gap-4 items-start shadow-sm">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-red-800 mb-1">تنبيه هام حول أكواد خصم أمازون</h3>
                    <p className="text-sm text-red-700 leading-relaxed">
                        أمازون لا تُصدر "أكواد خصم" موقعة لجميع المنتجات. معظم المتاجر تعرض أكواد وهمية. الطريقة الحقيقية الوحيدة للتوفير هي تفعيل الصفقات المخفية وعروض اليوم المبينة أدناه مباشرة من الموقع الرسمي.
                    </p>
                </div>
            </div>

            {/* Section 1: 🔥 أفضل الصفقات اليوم */}
            <div className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🔥</span>
                    <h2 className="text-2xl font-black text-gray-800">أفضل صفقات اليوم في {countryName}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topDeals.map((product, idx) => (
                        <AffiliateProductCard key={idx} {...product} />
                    ))}
                </div>
            </div>

            {/* Section 2: ⭐ المنتجات الأعلى تقييمًا */}
            <div className="mb-14">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <span className="text-2xl">⭐</span>
                    <h2 className="text-2xl font-black text-gray-800">المنتجات الأعلى تقييماً</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trending.map((product, idx) => (
                        <AffiliateProductCard key={idx} {...product} />
                    ))}
                </div>
            </div>

            {/* Phase 8: Mobile Sticky Conversional Action */}
            {showSticky && (
                <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
                    <a
                        href="https://amazon.sa"
                        target="_blank"
                        rel="nofollow noopener sponsored"
                        className="bg-gray-900 border-2 border-amber-400 shadow-[0_0_20px_rgba(0,0,0,0.3)] w-full py-4 px-6 rounded-2xl flex items-center justify-between"
                    >
                        <div className="flex flex-col">
                            <span className="text-white font-black">عروض أمازون الحصرية</span>
                            <span className="text-amber-400 text-xs font-bold">سينتهي العرض قريباً</span>
                        </div>
                        <span className="bg-amber-400 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm">
                            شاهد الكل
                        </span>
                    </a>
                </div>
            )}
        </div>
    );
}
