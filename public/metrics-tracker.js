/**
 * metrics-tracker.js
 * A lightweight, vanilla JS script to track user behavior, pageviews, and coupon interaction.
 * Uses Beacon API for zero-impact transmission.
 */

(function () {
    if (typeof window === 'undefined') return;

    // --- Configuration & State ---
    const API_ENDPOINT = '/api/analytics/track';

    // Generate or retrieve a temporary session ID (clears when browser closes)
    let sessionId = sessionStorage.getItem('_analytics_sid');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('_analytics_sid', sessionId);
    }

    const startTime = Date.now();
    let maxScrollDepth = 0;

    // Attempt tracking device type simply based on user agent (can be replaced by User-Agent header server-side later)
    const deviceType = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

    // Determine source
    let source = 'direct';
    const referrer = document.referrer;
    if (referrer) {
        if (referrer.includes('google.') || referrer.includes('bing.') || referrer.includes('yahoo.')) source = 'organic';
        else if (referrer.includes('facebook.') || referrer.includes('t.co') || referrer.includes('instagram.')) source = 'social';
        else source = 'referral';
    }

    // Baseline metadata sent with every event
    const getBasePayload = (eventType, additionalMetadata = {}) => ({
        session_id: sessionId,
        event_type: eventType,
        url: window.location.href,
        device: deviceType,
        source: source,
        country: window.location.pathname.split('/')[1] || 'unknown', // e.g., '/sa/stores' -> 'sa'
        metadata: additionalMetadata
    });

    // --- Core Transport ---
    function sendEvent(payload, useBeacon = false) {
        // Send via navigator.sendBeacon ideally (great for page unloads)
        if (useBeacon && navigator.sendBeacon) {
            // sendBeacon uses POST by default and accepts Blob/String/FormData
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(API_ENDPOINT, blob);
        } else {
            // Fallback for immediate clicks where we want fetch's keepalive
            fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true, // Crucial so it doesn't drop if user navigates away
            }).catch(() => { });
        }
    }

    // --- 1. Track Pageview (Immediately) ---
    sendEvent(getBasePayload('pageview'));


    // --- 2. Track Scroll Depth & Exit ---
    function onScroll() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (docHeight > 0) {
            const depth = Math.min(1.0, scrollTop / docHeight);
            if (depth > maxScrollDepth) maxScrollDepth = depth;
        }
    }

    function onPageExit() {
        const timeOnPageMs = Date.now() - startTime;
        sendEvent(getBasePayload('exit', {
            scroll_depth_pct: Math.round(maxScrollDepth * 100),
            time_on_page_sec: Math.round(timeOnPageMs / 1000)
        }), true /* use beacon */);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') onPageExit();
    });
    window.addEventListener('pagehide', onPageExit);


    // --- 3. Track Coupon Clicks & Deals ---
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!target) return;

        // Check if copy button clicked
        const copyBtn = target.closest('.coupon-copy-btn') || target.closest('button[aria-label*="نسخ"]');
        if (copyBtn) {
            // Guess coupon ID or details from nearest article or attributes
            const card = copyBtn.closest('article');
            const dataUrl = card ? card.getAttribute('data-coupon-url') : null;

            // Calculate position of the click
            const rect = copyBtn.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            let position = 'above_fold';
            if (rect.top > windowHeight) {
                position = rect.bottom > windowHeight * 2 ? 'bottom' : 'mid';
            }

            const timeToClickMs = Date.now() - startTime;

            sendEvent(getBasePayload('coupon_copy', {
                coupon_url: dataUrl,
                position: position,
                time_to_click_ms: timeToClickMs
            }), false);
            return;
        }

        // Check if deal clicked
        const dealLink = target.closest('a[aria-label*="تفعيل"]');
        if (dealLink) {
            const timeToClickMs = Date.now() - startTime;
            sendEvent(getBasePayload('deal_click', {
                deal_url: dealLink.href,
                time_to_click_ms: timeToClickMs
            }), false);
        }
    });

})();
