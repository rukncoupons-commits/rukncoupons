"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Store, Category, Coupon, BlogPost, SocialConfig, AdBanner } from "@/lib/types";
import Sidebar from "./Sidebar";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getStoreName, getStoreDescription, getCategoryName as getLocCatName } from "@/lib/locale-content";

interface StoresClientProps {
    initialStores: Store[];
    categories: Category[];
    allCoupons: Coupon[];
    recentPosts: BlogPost[];
    socialConfig: SocialConfig | null;
    adBanners: AdBanner[];
    countryCode: string;
    locale?: string;
}

export default function StoresClient({
    initialStores,
    categories,
    allCoupons,
    recentPosts,
    socialConfig,
    adBanners,
    countryCode,
    locale = "ar",
}: StoresClientProps) {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [selectedCategory, setSelectedCategory] = useState("");
    const isEn = locale === "en";
    const dir = isEn ? "ltr" : "rtl";
    const textAlign = isEn ? "text-left" : "text-right";

    const filteredStores = initialStores.filter((s) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = s.name.toLowerCase().includes(q) || (s.nameEn || "").toLowerCase().includes(q);
        const matchesCategory = !selectedCategory || s.category === selectedCategory;
        return matchesQuery && matchesCategory;
    });

    const getCouponCount = (storeId: string) => allCoupons.filter((c) => c.storeId === storeId).length;
    const getCatDisplayName = (catSlug: string | undefined) => {
        const cat = categories.find((c) => c.slug === catSlug);
        return cat ? getLocCatName(locale || "ar", cat) : "";
    };

    // Above-The-Fold Performance Optimization
    const [isDeferredLoaded, setIsDeferredLoaded] = useState(false);
    const deferredRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isDeferredLoaded || filteredStores.length <= 12) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsDeferredLoaded(true);
                observer.disconnect();
            }
        }, { rootMargin: '800px' });

        if (deferredRef.current) observer.observe(deferredRef.current);
        return () => observer.disconnect();
    }, [isDeferredLoaded, filteredStores.length]);

    return (
        <main className={`min-h-screen bg-gray-50 py-8 ${textAlign}`} dir={dir}>
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${locale}/${countryCode}`} className="hover:text-blue-600">{isEn ? "Home" : "الرئيسية"}</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">{isEn ? "All Stores" : "كل المتاجر"}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-800 mb-2">{isEn ? "All Stores & Brands" : "جميع المتاجر والعلامات التجارية"}</h1>
                            <p className="text-gray-500">{isEn ? "Browse hundreds of stores and get exclusive discount codes" : "تصفح مئات المتاجر واحصل على أكواد خصم حصرية"}</p>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                    <div className="relative w-full md:w-2/3">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={isEn ? "Search by name..." : "ابحث بالاسم..."}
                                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-10 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700`}
                                        />
                                        <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                                    </div>
                                    <button
                                        onClick={() => { setSearchQuery(""); setSelectedCategory(""); }}
                                        className="text-sm text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <span>{isEn ? "Clear filters" : "مسح التصفية"}</span>
                                        {(searchQuery || selectedCategory) && <X className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        onClick={() => setSelectedCategory("")}
                                        className={cn(
                                            "px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors",
                                            selectedCategory === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        {isEn ? "All" : "الكل"}
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.slug === selectedCategory ? "" : cat.slug)}
                                            className={cn(
                                                "px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors",
                                                selectedCategory === cat.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            )}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}>
                            {filteredStores.slice(0, 12).map((store, index) => {
                                const count = getCouponCount(store.id);
                                const isLCP = index < 4; // Top 4 images in grid are likely LCP
                                return (
                                    <Link
                                        key={store.id}
                                        href={`/${locale}/${countryCode}/${store.slug}`}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col items-center text-center relative"
                                        aria-label={isEn ? `Browse ${getStoreName(locale || 'ar', store)} store` : `تصفح متجر ${getStoreName(locale || 'ar', store)}`}
                                    >
                                        {store.category && (
                                            <span className="absolute top-3 right-3 text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">
                                                {getCatDisplayName(store.category)}
                                            </span>
                                        )}
                                        <div className="w-20 h-20 rounded-full border border-gray-100 p-2 mb-4 bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <Image
                                                src={store.logoUrl.trim()}
                                                alt={getStoreName(locale || 'ar', store)}
                                                className="w-full h-full object-contain rounded-full"
                                                width={80}
                                                height={80}
                                                sizes="80px"
                                                priority={isLCP}
                                                loading={isLCP ? "eager" : "lazy"}
                                            />
                                        </div>
                                        <h2 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                                            {isEn ? `${getStoreName('en', store)} Coupon Code` : `كود خصم ${getStoreName('ar', store)}`}
                                        </h2>
                                        {store.description && (
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2 px-1">
                                                {getStoreDescription(locale || 'ar', store)}
                                            </p>
                                        )}
                                        {count > 0 ? (
                                            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold border border-green-100">
                                                {count} {isEn ? "active deals" : "عرض فعال"}
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-50 text-gray-400 px-3 py-1 rounded-full border border-gray-100">
                                                {isEn ? "No deals" : "لا توجد عروض"}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}

                            {/* Intersection Sentinel */}
                            {filteredStores.length > 12 && !isDeferredLoaded && (
                                <div ref={deferredRef} className="col-span-full h-[200px] w-full flex items-center justify-center" aria-hidden="true" />
                            )}

                            {/* Deferred Rendering */}
                            {isDeferredLoaded && filteredStores.slice(12).map((store) => {
                                const count = getCouponCount(store.id);
                                return (
                                    <Link
                                        key={store.id}
                                        href={`/${locale}/${countryCode}/${store.slug}`}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col items-center text-center relative"
                                        aria-label={isEn ? `Browse ${getStoreName(locale || 'ar', store)} store` : `تصفح متجر ${getStoreName(locale || 'ar', store)}`}
                                    >
                                        {store.category && (
                                            <span className="absolute top-3 right-3 text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">
                                                {getCatDisplayName(store.category)}
                                            </span>
                                        )}
                                        <div className="w-20 h-20 rounded-full border border-gray-100 p-2 mb-4 bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <Image src={store.logoUrl.trim()} alt={getStoreName(locale || 'ar', store)} className="w-full h-full object-contain rounded-full" width={80} height={80} sizes="80px" loading="lazy" />
                                        </div>
                                        <h2 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                                            {isEn ? `${getStoreName('en', store)} Coupon Code` : `كود خصم ${getStoreName('ar', store)}`}
                                        </h2>
                                        {store.description && (
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2 px-1">
                                                {getStoreDescription(locale || 'ar', store)}
                                            </p>
                                        )}
                                        {count > 0 ? (
                                            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold border border-green-100">
                                                {count} {isEn ? "active deals" : "عرض فعال"}
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-50 text-gray-400 px-3 py-1 rounded-full border border-gray-100">
                                                {isEn ? "No deals" : "لا توجد عروض"}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                            {filteredStores.length === 0 && (
                                <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="text-5xl mb-4">🕵️</div>
                                    <p className="text-lg font-bold">{isEn ? "No stores match your search." : "لا توجد متاجر تطابق بحثك حالياً."}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 xl:col-span-3">
                        <Sidebar
                            ads={adBanners}
                            recentPosts={recentPosts}
                            socialConfig={socialConfig}
                            storesCount={initialStores.length}
                            couponsCount={allCoupons.length}
                            countryCode={countryCode}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
