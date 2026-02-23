"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Slide, Store, Category, Coupon, BlogPost, SocialConfig, AdBanner } from "@/lib/types";
import CouponCard from "./CouponCard";
import Sidebar from "./Sidebar";
import CouponModal from "./CouponModal";
import { Zap, Tag, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeClientProps {
    initialSlides: Slide[];
    featuredStores: Store[];
    categories: Category[];
    initialCoupons: Coupon[];
    allStores: Store[];
    recentPosts: BlogPost[];
    socialConfig: SocialConfig | null;
    adBanners: AdBanner[];
    countryCode: string;
}

export default function HomeClient({
    initialSlides,
    featuredStores,
    categories,
    initialCoupons,
    allStores,
    recentPosts,
    socialConfig,
    adBanners,
    countryCode,
}: HomeClientProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [activeCoupon, setActiveCoupon] = useState<{ coupon: Coupon, store: Store | null } | null>(null);

    // Auto-slide effect
    useEffect(() => {
        if (initialSlides.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % initialSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [initialSlides.length]);

    const filteredCoupons = initialCoupons
        .filter((c) => !selectedCategory || c.categories.includes(selectedCategory))
        .sort((a, b) => {
            if (a.isExclusive && !b.isExclusive) return -1;
            if (!a.isExclusive && b.isExclusive) return 1;
            return 0;
        });

    const getStoreForCoupon = (storeId: string) => allStores.find((s) => s.id === storeId);
    const getCategoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name || "";

    const handleCouponAction = (coupon: Coupon) => {
        const store = getStoreForCoupon(coupon.storeId) || null;
        setActiveCoupon({ coupon, store });
    };

    return (
        <main className="min-h-screen pb-12 overflow-x-hidden bg-gray-50 text-right" dir="rtl">
            <CouponModal
                isOpen={!!activeCoupon}
                coupon={activeCoupon?.coupon || null}
                store={activeCoupon?.store || null}
                onClose={() => setActiveCoupon(null)}
            />
            <div className="container mx-auto py-6 space-y-10 px-4">

                {/* SLIDER */}
                <section className="w-full relative h-[200px] md:h-[300px] lg:h-[360px] rounded-3xl overflow-hidden shadow-lg group bg-gray-200">
                    {initialSlides.length > 0 ? (
                        <>
                            {initialSlides.map((slide, i) => (
                                <Link
                                    key={slide.id}
                                    href={slide.linkUrl || "#"}
                                    aria-label={slide.title ? `عرض: ${slide.title}` : "نظرة على العرض"}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out block ${currentSlide === i ? "opacity-100 z-10" : "opacity-0 z-0"
                                        }`}
                                >
                                    <img src={slide.image} className="w-full h-full object-cover" alt={slide.title || "Slide"} />
                                    <div className="absolute inset-0 flex flex-col justify-end items-start p-6 pb-10 md:p-12 md:justify-center text-white bg-gradient-to-t from-black/60 to-transparent md:bg-none">
                                        {slide.title && (
                                            <>
                                                <span className="bg-red-600 text-white text-[10px] md:text-sm font-bold px-3 py-1 rounded-full mb-3 shadow-sm animate-pulse">
                                                    🔥 عروض حصرية
                                                </span>
                                                <h2 className="text-2xl md:text-4xl font-black mb-3 leading-tight max-w-xl drop-shadow-lg">
                                                    {slide.title}
                                                </h2>
                                            </>
                                        )}
                                        {slide.description && (
                                            <p className="text-sm md:text-lg text-gray-100 mb-6 max-w-lg drop-shadow-md line-clamp-2">
                                                {slide.description}
                                            </p>
                                        )}
                                        <span className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-2 px-6 rounded-xl text-sm md:text-base transition-all transform hover:scale-105 shadow-lg inline-block">
                                            احصل على الخصم
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {/* Dots */}
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                {initialSlides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`h-2 rounded-full transition-all shadow-sm ${currentSlide === i ? "bg-white w-8" : "bg-white/50 w-2"
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 animate-pulse">
                            جاري تحميل العروض...
                        </div>
                    )}
                </section>

                {/* POPULAR STORES */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">🛍️</span> المتاجر الشائعة
                        </h3>
                        <Link href={`/${countryCode}/stores`} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            عرض الكل
                        </Link>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x overflow-y-visible">
                        {featuredStores.map((store) => (
                            <Link
                                key={store.id}
                                href={`/${countryCode}/${store.slug}`}
                                aria-label={`متجر ${store.name}`}
                                className="flex flex-col items-center gap-3 min-w-[80px] snap-start group cursor-pointer py-2"
                            >
                                <div className="w-20 h-20 rounded-full border-2 border-white p-1 bg-white shadow-md group-hover:border-blue-500 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center overflow-hidden">
                                    <img src={store.logoUrl} alt={store.name} className="w-full h-full object-contain rounded-full" />
                                </div>
                                <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600 truncate max-w-[90px] text-center transition-colors">
                                    {store.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* CATEGORIES */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">🏷️</span> التصنيفات
                        </h3>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide snap-x">
                        <button
                            onClick={() => setSelectedCategory("")}
                            className="flex flex-col items-center gap-2 min-w-[70px] snap-start group"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 transition-all",
                                selectedCategory === "" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-100 text-blue-600 hover:border-blue-400"
                            )}>
                                ♾️
                            </div>
                            <span className="text-xs font-bold text-gray-700">الكل</span>
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.slug)}
                                className="flex flex-col items-center gap-2 min-w-[70px] snap-start group"
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 transition-all",
                                    selectedCategory === cat.slug ? "bg-blue-100 border-blue-500" : "bg-white border-gray-100 group-hover:border-blue-400"
                                )}>
                                    {cat.icon || "🏷️"}
                                </div>
                                <span className={cn(
                                    "text-xs font-bold text-gray-700 transition-colors",
                                    selectedCategory === cat.slug && "text-blue-600"
                                )}>
                                    {cat.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* MAIN CONTENT SPLIT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-gray-200">

                    {/* LATEST COUPONS GRID */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                أحدث الكوبونات
                                {selectedCategory && (
                                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {getCategoryName(selectedCategory)}
                                    </span>
                                )}
                            </h3>
                        </div>

                        {filteredCoupons.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {filteredCoupons.map((coupon) => (
                                    <CouponCard
                                        key={coupon.id}
                                        coupon={coupon}
                                        store={getStoreForCoupon(coupon.storeId)}
                                        categoryName={getCategoryName(getStoreForCoupon(coupon.storeId)?.category || "")}
                                        onAction={handleCouponAction}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-200 w-full mt-4">
                                <div className="text-6xl mb-6">😔</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">عذراً، لا توجد كوبونات في هذا التصنيف</h3>
                                <p className="text-gray-500 max-w-md mx-auto">جرب اختيار تصنيف آخر أو تصفح جميع المتاجر للحصول على أفضل العروض.</p>
                                <button onClick={() => setSelectedCategory("")} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                                    عرض جميع الكوبونات
                                </button>
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <Link href={`/${countryCode}/coupons`} className="inline-flex items-center gap-3 bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-bold py-4 px-10 rounded-2xl shadow-sm hover:shadow-md transition-all" aria-label="عرض كافة الكوبونات">
                                <span>عرض جميع الكوبونات</span>
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <Sidebar
                            ads={adBanners}
                            recentPosts={recentPosts}
                            socialConfig={socialConfig}
                            storesCount={allStores.length}
                            couponsCount={initialCoupons.length}
                            countryCode={countryCode}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
