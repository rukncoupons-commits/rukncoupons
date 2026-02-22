/**
 * CouponListServer — Server Component
 * Replaces StoreClient.tsx entirely. Zero JS, zero modal, zero state.
 * Renders coupon grid server-side; CouponCardServer handles reveal via CSS.
 */
import React from "react";
import { Store, Coupon, Category } from "@/lib/types";
import CouponCardServer from "./CouponCardServer";

interface Props {
    store: Store;
    coupons: Coupon[];
    countryCode: string;
    countryName: string;
    categoryName?: string;
}

export default function CouponListServer({ store, coupons, countryCode, countryName, categoryName }: Props) {
    const today = new Date().toISOString().split("T")[0];
    const active = coupons.filter(c => !c.expiryDate || c.expiryDate >= today);

    return (
        <section aria-label={`كوبونات ${store.name} في ${countryName}`}>
            {active.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {active.map((coupon) => (
                        <CouponCardServer
                            key={coupon.id}
                            coupon={coupon}
                            store={store}
                            categoryName={categoryName}
                            countryCode={countryCode}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-200 w-full">
                    <div className="text-5xl mb-4" aria-hidden="true">😔</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">عذراً، لا توجد كوبونات حالياً</h3>
                    <p className="text-gray-500">نحن نعمل على إضافة عروض جديدة لمتجر {store.name} قريباً.</p>
                </div>
            )}
        </section>
    );
}
