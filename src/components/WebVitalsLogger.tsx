"use client";

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect, useState } from 'react';

export default function WebVitalsLogger() {
    const [country, setCountry] = useState('unknown');

    useEffect(() => {
        const match = document.cookie.match(/country_preference=([^;]+)/);
        if (match) setCountry(match[1]);
        else setCountry(window.location.pathname.split('/')[1] || 'sa');
    }, []);

    useReportWebVitals((metric) => {
        const body = JSON.stringify({
            event: 'web_vitals',
            data: {
                name: metric.name,
                value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                rating: metric.rating,
                delta: metric.delta,
                id: metric.id,
                country: country,
                url: window.location.href,
            }
        });

        // Use sendBeacon for un-blockable analytics dispatch
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/track', body);
        } else {
            fetch('/api/analytics/track', {
                body,
                method: 'POST',
                keepalive: true,
                headers: { 'Content-Type': 'application/json' }
            }).catch(() => { });
        }
    });

    return null;
}
