"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, Category, Coupon, BlogPost, SocialConfig, AdBanner } from "@/lib/types";
import Sidebar from "./Sidebar";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoresClientProps {
    initialStores: Store[];
    categories: Category[];
    allCoupons: Coupon[];
    recentPosts: BlogPost[];
    socialConfig: SocialConfig | null;
    adBanners: AdBanner[];
    countryCode: string;
    initialQuery?: string;
}

export default function StoresClient({
    initialStores,
    categories,
    allCoupons,
    recentPosts,
    socialConfig,
    adBanners,
    countryCode,
    initialQuery = "",
}: StoresClientProps) {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState("");

    const filteredStores = initialStores.filter((s) => {
        const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
        const matchesCategory = !selectedCategory || s.category === selectedCategory;
        return matchesQuery && matchesCategory;
    });

    const getCouponCount = (storeId: string) => allCoupons.filter((c) => c.storeId === storeId).length;
    const getCategoryName = (catSlug: string | undefined) => categories.find((c) => c.slug === catSlug)?.name || "";

    return (
        <main className="min-h-screen bg-gray-50 py-8 text-right" dir="rtl">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${countryCode}`} className="hover:text-blue-600">الرئيسية</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">كل المتاجر</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-800 mb-2">جميع المتاجر والعلامات التجارية</h1>
                            <p className="text-gray-500">تصفح مئات المتاجر واحصل على أكواد خصم حصرية</p>
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
                                            placeholder="ابحث بالاسم..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-10 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700"
                                        />
                                        <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                                    </div>
                                    <button
                                        onClick={() => { setSearchQuery(""); setSelectedCategory(""); }}
                                        className="text-sm text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <span>مسح التصفية</span>
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
                                        الكل
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
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredStores.map((store) => {
                                const count = getCouponCount(store.id);
                                return (
                                    <Link
                                        key={store.id}
                                        href={`/${countryCode}/${store.slug}`}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col items-center text-center relative"
                                    >
                                        {store.category && (
                                            <span className="absolute top-3 right-3 text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">
                                                {getCategoryName(store.category)}
                                            </span>
                                        )}
                                        <div className="w-20 h-20 rounded-full border border-gray-100 p-2 mb-4 bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <img src={store.logoUrl} alt={store.name} className="w-full h-full object-contain rounded-full" />
                                        </div>
                                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                                            كود خصم {store.name}
                                        </h3>
                                        {store.description && (
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2 px-1">
                                                {store.description}
                                            </p>
                                        )}
                                        {count > 0 ? (
                                            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold border border-green-100">
                                                {count} عرض فعال
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-50 text-gray-400 px-3 py-1 rounded-full border border-gray-100">
                                                لا توجد عروض
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                            {filteredStores.length === 0 && (
                                <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="text-5xl mb-4">🕵️</div>
                                    <p className="text-lg font-bold">لا توجد متاجر تطابق بحثك حالياً.</p>
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
