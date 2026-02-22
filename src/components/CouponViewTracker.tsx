"use client";

import { useEffect, useRef } from "react";

/**
 * Invisible component that uses IntersectionObserver to track when a coupon 
 * actually enters the user's viewport, firing a background "view" tracking request.
 */
export default function CouponViewTracker({ couponId }: { couponId: string }) {
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = triggerRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                // Fire and forget view tracking API call
                fetch('/api/tracking/interaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ couponId, action: 'view' })
                }).catch(() => { });

                // Disconnect immediately so it only counts as 1 view per session
                observer.disconnect();
            }
        }, { threshold: 0.5 }); // Trigger when 50% of the card is visible

        observer.observe(currentRef);

        return () => observer.disconnect();
    }, [couponId]);

    return <div ref={triggerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />;
}
