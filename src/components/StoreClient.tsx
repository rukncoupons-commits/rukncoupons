"use client";

import React, { useState } from "react";
import { Store, Coupon, Category } from "@/lib/types";
import CouponCard from "./CouponCard";
import CouponModal from "./CouponModal";

interface StoreClientProps {
    store: Store;
    coupons: Coupon[];
    countryCode: string;
    countryName: string;
    categoryName?: string;
}

export default function StoreClient({ store, coupons, countryCode, countryName, categoryName }: StoreClientProps) {
    const [activeCoupon, setActiveCoupon] = useState<{ coupon: Coupon, store: Store | null } | null>(null);

    const handleCouponAction = (coupon: Coupon) => {
        setActiveCoupon({ coupon, store });
    };

    return (
        <>
            <CouponModal
                isOpen={!!activeCoupon}
                coupon={activeCoupon?.coupon || null}
                store={activeCoupon?.store || null}
                onClose={() => setActiveCoupon(null)}
            />

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>أفضل كوبونات {store.name} في {countryName}</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">
                    {coupons.length} عرض
                </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {coupons.map((coupon) => (
                    <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        store={store}
                        categoryName={categoryName}
                        onAction={handleCouponAction}
                    />
                ))}
            </div>

            {coupons.length === 0 && (
                <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-200 w-full">
                    <div className="text-5xl mb-4">😔</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">عذراً، لا توجد كوبونات حالياً</h3>
                    <p className="text-gray-500">نحن نعمل على إضافة عروض جديدة لمتجر {store.name} قريباً.</p>
                </div>
            )}
        </>
    );
}
