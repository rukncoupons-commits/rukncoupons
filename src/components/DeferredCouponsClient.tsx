"use client";

import React, { useState, useEffect, useRef } from "react";
import { Coupon, Store } from "@/lib/types";
import CouponCardServer from "./CouponCardServer";

interface Props {
    coupons: Coupon[];
    store?: Store;
    categoryName?: string;
    countryCode: string;
}

export default function DeferredCouponsClient({ coupons, store, categoryName, countryCode }: Props) {
    const [isLoaded, setIsLoaded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoaded || coupons.length === 0) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsLoaded(true);
                observer.disconnect();
            }
        }, { rootMargin: '800px' });

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [isLoaded, coupons.length]);

    if (coupons.length === 0) return null;

    if (!isLoaded) {
        return <div ref={ref} className="col-span-full h-[200px] w-full flex items-center justify-center" aria-hidden="true" />;
    }

    return (
        <>
            {coupons.map((coupon) => (
                <CouponCardServer
                    key={coupon.id}
                    coupon={coupon}
                    store={store}
                    categoryName={categoryName}
                    countryCode={countryCode}
                />
            ))}
        </>
    );
}
