"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store, Category, Coupon, BlogPost, SocialConfig, AdBanner } from "@/lib/types";
import Sidebar from "./Sidebar";
import CouponCard from "./CouponCard";
import CouponModal from "./CouponModal";
import { Zap, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CouponsClientProps {
    initialCoupons: Coupon[];
    stores: Store[];
    categories: Category[];
    recentPosts: BlogPost[];
    socialConfig: SocialConfig | null;
    adBanners: AdBanner[];
    countryCode: string;
}

export default function CouponsClient({
    initialCoupons,
    stores,
    categories,
    recentPosts,
    socialConfig,
    adBanners,
    countryCode,
}: CouponsClientProps) {
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
    const [activeCoupon, setActiveCoupon] = useState<{ coupon: Coupon, store: Store | null } | null>(null);

    const handleCouponAction = (coupon: Coupon) => {
        const store = getStoreForCoupon(coupon.storeId) || null;
        setActiveCoupon({ coupon, store });
    };

    const filteredCoupons = initialCoupons.filter((c) => {
        const matchesStore = !selectedStoreId || c.storeId === selectedStoreId;
        const matchesCategory = !selectedCategorySlug || c.categories?.includes(selectedCategorySlug);
        return matchesStore && matchesCategory;
    });

    const getStoreForCoupon = (storeId: string) => stores.find((s) => s.id === storeId);
    const getCategoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name || "";

    return (
        <main className="min-h-screen bg-gray-50 py-8 text-right" dir="rtl">
            <CouponModal
                isOpen={!!activeCoupon}
                coupon={activeCoupon?.coupon || null}
                store={activeCoupon?.store || null}
                onClose={() => setActiveCoupon(null)}
            />
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="flex mb-6 text-sm text-gray-500 gap-2">
                    <Link href={`/${countryCode}`} className="hover:text-blue-600">الرئيسية</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-bold">جميع الكوبونات</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="mb-6">
                            <h1 className="text-3xl font-black text-gray-800 mb-2">جميع الكوبونات والعروض</h1>
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="relative w-full md:w-1/2">
                                        <select
                                            value={selectedStoreId}
                                            onChange={(e) => setSelectedStoreId(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700 appearance-none"
                                        >
                                            <option value="">كل المتاجر</option>
                                            {stores.map((store) => (
                                                <option key={store.id} value={store.id}>{store.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={() => { setSelectedStoreId(""); setSelectedCategorySlug(""); }}
                                        className="text-sm text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors mr-auto"
                                    >
                                        مسح التصفية
                                    </button>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        onClick={() => setSelectedCategorySlug("")}
                                        className={cn(
                                            "px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors",
                                            selectedCategorySlug === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        الكل
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategorySlug(cat.slug === selectedCategorySlug ? "" : cat.slug)}
                                            className={cn(
                                                "px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2",
                                                selectedCategorySlug === cat.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            )}
                                        >
                                            <span>{cat.icon}</span>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
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
                            <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-200 w-full mt-4">
                                <div className="text-6xl mb-6">🔍</div>
                                <h2 className="text-xl font-bold text-gray-800 mb-3">لا توجد نتائج</h2>
                                <p className="text-gray-500">جرب تغيير خيارات التصفية للعثور على عروض أكثر.</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 xl:col-span-3">
                        <Sidebar
                            ads={adBanners}
                            recentPosts={recentPosts}
                            socialConfig={socialConfig}
                            storesCount={stores.length}
                            couponsCount={initialCoupons.length}
                            countryCode={countryCode}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
