/**
 * PHASE 1 & 8: BEHAVIORAL TRACKING SCRIPT
 * 
 * Zero-dependency, non-blocking user behavior tracker.
 * Loaded via next/script strategy="afterInteractive" in layout.tsx.
 * 
 * Sends a beacon on page exit via navigator.sendBeacon() (reliable even on tab close).
 * 
 * Payload sent to /api/tracking/heatmap:
 *   url           – current page URL
 *   scrollDepth   – 0.0–1.0 maximum scroll fraction reached
 *   timeOnPage    – seconds from page load to exit
 *   device        – 'mobile' | 'desktop'
 *   referrer      – document.referrer
 *   paragraphsRead – count of <p> tags the user scrolled past
 *   totalParagraphs – total <p> tag count in article
 *   abVariant     – 'A' | 'B' from ab_placement cookie
 *   converted     – true if user clicked a .coupon-copy-btn during the session
 */
(function () {
    if (typeof window === 'undefined') return;
    if (!window.location.pathname.includes('/blog/')) return;

    var startTime = Date.now();
    var maxScrollDepth = 0;
    var converted = false;

    // Count total <p> tags in article body
    var articleEl = document.querySelector('.blog-content') || document.querySelector('article') || document.body;
    var totalParagraphs = articleEl ? articleEl.querySelectorAll('p').length : 0;

    // Track scroll depth
    function onScroll() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (docHeight > 0) {
            var depth = Math.min(1.0, scrollTop / docHeight);
            if (depth > maxScrollDepth) maxScrollDepth = depth;
        }
    }

    // Track coupon conversions (click on CopyButton)
    function onCouponClick(e) {
        var target = e.target;
        if (target && (
            target.closest('[data-coupon-copy]') ||
            target.closest('.coupon-copy-btn') ||
            target.closest('[data-copy-code]')
        )) {
            converted = true;
        }
    }

    // Count how many paragraphs the user scrolled past
    function countParagraphsRead() {
        if (!articleEl) return 0;
        var paragraphs = articleEl.querySelectorAll('p');
        var count = 0;
        var viewportBottom = window.scrollY + window.innerHeight;
        for (var i = 0; i < paragraphs.length; i++) {
            var rect = paragraphs[i].getBoundingClientRect();
            if (rect.top + window.scrollY < viewportBottom) {
                count++;
            }
        }
        return count;
    }

    // Read A/B placement cookie
    function getAbVariant() {
        var match = document.cookie.match(/(?:^|;\s*)ab_placement=([AB])/);
        return match ? match[1] : null;
    }

    // Detect device type
    function getDevice() {
        return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    }

    // Send beacon on exit
    function sendBeacon() {
        if (!navigator.sendBeacon) return;

        var timeOnPage = Math.round((Date.now() - startTime) / 1000);
        var paragraphsRead = countParagraphsRead();

        var payload = JSON.stringify({
            url: window.location.href,
            scrollDepth: Math.round(maxScrollDepth * 1000) / 1000,
            timeOnPage: timeOnPage,
            device: getDevice(),
            referrer: document.referrer || '',
            paragraphsRead: paragraphsRead,
            totalParagraphs: totalParagraphs,
            abVariant: getAbVariant(),
            converted: converted,
        });

        navigator.sendBeacon('/api/tracking/heatmap', payload);
    }

    // Event listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onCouponClick);
    window.addEventListener('beforeunload', sendBeacon);

    // Also send on visibility change (handles mobile tab switching)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            sendBeacon();
        }
    });
})();
