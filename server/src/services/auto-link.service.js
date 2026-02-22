'use strict';

/**
 * Server-side AutoLink Service
 * Port of Angular's AutoLinkService using regex instead of DOM parsing
 */

const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Process blog post HTML content:
 * - Injects IDs into H2/H3 headings for TOC
 * - Auto-links first mention of store names
 * Returns { processedHtml, detectedStoreIds, toc }
 */
function processContent(html, post, countryCode, stores) {
    if (!html) return { processedHtml: '', detectedStoreIds: [], toc: [] };

    let processedHtml = html;
    const detectedStoreIds = [];
    const toc = [];

    // 1. Inject IDs into H2/H3 headings and build TOC
    let headingIndex = 0;
    processedHtml = processedHtml.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, text) => {
        const id = `section-${headingIndex}`;
        const cleanText = text.replace(/<[^>]*>/g, '');
        toc.push({ id, text: cleanText, level: parseInt(level) });
        headingIndex++;
        return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    });

    // 2. Auto-link store names (only if post.autoLink is enabled)
    if (post.autoLink && stores && stores.length > 0) {
        const activeStores = stores.filter(s => s.isActive !== false);
        // Sort by name length desc to match longer names first
        const sorted = [...activeStores].sort((a, b) => b.name.length - a.name.length);
        const linkedStoreIds = new Set();

        for (const store of sorted) {
            if (linkedStoreIds.has(store.id)) continue;

            const pattern = new RegExp(`(?<![\\w>])${escapeRegExp(store.name)}(?![\\w<])`, 'i');

            // Only replace if not already inside an <a> tag
            // Simple approach: replace first occurrence that's not inside a tag
            const newHtml = processedHtml.replace(pattern, (match, offset) => {
                // Check if we're inside an anchor tag by looking at surrounding context
                const before = processedHtml.substring(0, offset);
                const openAnchors = (before.match(/<a\s/gi) || []).length;
                const closeAnchors = (before.match(/<\/a>/gi) || []).length;
                if (openAnchors > closeAnchors) return match; // Inside <a>, skip

                linkedStoreIds.add(store.id);
                detectedStoreIds.push(store.id);
                return `<a href="/${countryCode}/${store.slug}" class="text-blue-600 font-bold hover:underline">${match}</a>`;
            });

            if (newHtml !== processedHtml) {
                processedHtml = newHtml;
            }
        }
    }

    return { processedHtml, detectedStoreIds, toc };
}

/**
 * Resolve related coupons for a blog post
 * Priority: pinned > manual stores > auto-detected stores
 */
function mergeRelatedCoupons(post, autoDetectedStoreIds = [], allCoupons = []) {
    const results = [];
    const seen = new Set();

    const add = (coupons) => {
        coupons.forEach(c => {
            if (!seen.has(c.id)) {
                results.push(c);
                seen.add(c.id);
            }
        });
    };

    // 1. Pinned coupons
    if (post.manualCouponIds && post.manualCouponIds.length > 0) {
        add(allCoupons.filter(c => post.manualCouponIds.includes(c.id)));
    }

    // 2. Manual stores
    const manualStores = [...(post.manualStoreIds || []), ...(post.relatedStoreIds || [])];
    if (manualStores.length > 0) {
        const storeCoupons = allCoupons
            .filter(c => manualStores.includes(c.storeId))
            .sort((a, b) => Number(b.isExclusive) - Number(a.isExclusive));
        add(storeCoupons);
    }

    // 3. Auto-detected stores
    if (autoDetectedStoreIds.length > 0) {
        const autoIds = autoDetectedStoreIds.filter(id => !manualStores.includes(id));
        add(allCoupons.filter(c => autoIds.includes(c.storeId)));
    }

    return results.slice(0, 6);
}

module.exports = { processContent, mergeRelatedCoupons };
