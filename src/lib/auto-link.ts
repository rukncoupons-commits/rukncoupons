import { BlogPost, Store } from "./types";

/**
 * ═══════════════════════════════════════════════════════════════════
 *  AUTO-LINK ENGINE — Unified SSR Orchestration Hub
 *  Integrates Phase 3, 4, 5 & 7 into one coherent processing pipeline.
 * ═══════════════════════════════════════════════════════════════════
 *
 *  PIPELINE ORDER:
 *   1. Heading ID injection (for TOC anchors)
 *   2. Phase 4  — Dynamic Anchor Optimization (Store name linking with discount prefix sliding window)
 *   3. Phase 7  — Auto Topical Cluster Building (AI keyword → cross-blog linking)
 *   4. Phase 3  — Behavioral Injection Scoring (compute best paragraph index via heatmap formula)
 *   5. Return   — ProcessResult with all metadata for caller (page.tsx)
 *
 *  Phase 5 (SSR DOM Injection) is then called in page.tsx, consuming the
 *  `optimalInjectionIndex` returned by this function.
 * ═══════════════════════════════════════════════════════════════════
 */

export interface ProcessResult {
    processedHtml: string;
    detectedStoreIds: string[];
    anchorVariations: Record<string, number>;
    anchorDiversityScore: number;      // 0.0–1.0: how well-diversified anchors are
    optimalInjectionIndex: number;     // Computed by Phase 3 ranking formula
    injectionScoreBreakdown: string;   // Human-readable debug of the ranking math
    paragraphCount: number;            // Total paragraphs detected
}

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ────────────────────────────────────────────────────────────────────────────────
// PHASE 3: BEHAVIORAL INJECTION SCORING FORMULA
// ────────────────────────────────────────────────────────────────────────────────
/**
 * Computes the optimal paragraph index to inject a coupon block.
 *
 * FORMULA:
 *   FinalScore(i) = W1 × intentWeight + W2 × scrollSurvival(i) + W3 × histCTR(i)
 *
 * WHERE:
 *   W1 = 0.40  ← Search intent weight (transactional=1.0, commercial=0.8, informational=0.3)
 *   W2 = 0.40  ← Probability mass surviving at depth i (from heatmap avg_scroll_depth)
 *   W3 = 0.20  ← Historical conversion rate hotspot at paragraph i
 *
 *   scrollSurvival(i) = max(0, 1 - |i - targetIndex| × 0.25)
 *   targetIndex = floor(paragraphs × clamp(avgScroll × 0.8, mobileMin, mobileMax))
 *
 * MOBILE CLAMP: depth capped between 25%–45% to avoid above-fold overload
 *   and deep-scroll abandonment zone.
 */
function computeInjectionScore(
    post: BlogPost,
    paragraphCount: number,
    isMobile: boolean = false
): { blockIndex: number; score: number; breakdown: string } {
    const data = post.behavioral_data;

    // ── Intent Weight (W1) ─────────────────────────────────────────────
    let intentWeight = 0.5; // Default: navigational
    if (post.aiIntentType === 'transactional') intentWeight = 1.0;
    else if (post.aiIntentType === 'commercial') intentWeight = 0.8;
    else if (post.aiIntentType === 'informational') intentWeight = 0.3;

    // ── Behavioral Depth Target (from heatmap data) ────────────────────
    const avgScroll = data?.avg_scroll_depth ?? 0;
    let targetDepth = avgScroll > 0 ? avgScroll * 0.8 : 0.35; // Default 35% depth if no data

    if (isMobile) {
        targetDepth = Math.min(targetDepth, 0.45);
        targetDepth = Math.max(targetDepth, 0.25);
    } else {
        targetDepth = Math.min(targetDepth, 0.70);
        targetDepth = Math.max(targetDepth, 0.20);
    }

    const baseIndex = Math.max(1, Math.floor(paragraphCount * targetDepth));

    // ── Score a ±3 window around the base index ────────────────────────
    const offsets = [-2, -1, 0, 1, 2, 3];
    let bestScore = -1;
    let bestIndex = baseIndex;
    let bestBreakdown = '';

    for (const offset of offsets) {
        const candidateIdx = baseIndex + offset;
        if (candidateIdx < 1 || candidateIdx >= paragraphCount) continue;

        const distance = Math.abs(offset);
        const scrollSurvival = Math.max(0, 1 - distance * 0.25);
        // Bug fix: conversion_hotspots keys are strings in Firestore (Phase 8 schema)
        const histCTR = data?.conversion_hotspots?.[String(candidateIdx)] ?? 0;

        // ── EXACT FORMULA ──────────────────────────────────────────────
        const w1 = 0.40 * intentWeight;      // Intent relevance
        const w2 = 0.40 * scrollSurvival;    // Traffic survival probability
        const w3 = 0.20 * histCTR;           // Proven conversion history
        const finalScore = w1 + w2 + w3;

        if (finalScore > bestScore) {
            bestScore = finalScore;
            bestIndex = candidateIdx;
            bestBreakdown = `idx:${candidateIdx} | intent(${post.aiIntentType ?? 'unknown'})=${intentWeight.toFixed(2)} | scroll=${avgScroll.toFixed(2)} | target_depth=${targetDepth.toFixed(2)} | W1=${w1.toFixed(3)} W2=${w2.toFixed(3)} W3=${w3.toFixed(3)} = ${finalScore.toFixed(3)}`;
        }
    }

    return { blockIndex: bestIndex, score: bestScore, breakdown: bestBreakdown };
}

// ────────────────────────────────────────────────────────────────────────────────
// PHASE 4: ANCHOR DIVERSITY SCORE
// ────────────────────────────────────────────────────────────────────────────────
/**
 * Calculates how well diversified the anchor texts are.
 * Score = 1.0 means perfectly distributed; <0.5 means over-optimized (risky).
 * 
 * FORMULA:
 *   diversity = 1 - (mostUsedCount / totalLinks)
 */
function computeAnchorDiversityScore(anchorVariations: Record<string, number>): number {
    const counts = Object.values(anchorVariations);
    if (counts.length === 0) return 1.0;
    const total = counts.reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...counts);
    return 1 - (maxCount / total);
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN PIPELINE
// ────────────────────────────────────────────────────────────────────────────────
export function processBlogContent(
    content: string,
    allStores: Store[],
    countryCode: string,
    post?: BlogPost,
    allPosts?: BlogPost[]
): ProcessResult {
    let processedHtml = content;
    const detectedStoreIds = new Set<string>();
    const anchorVariations: Record<string, number> = {};

    // Limits — SEO safety guards
    const MAX_LINKS_PER_STORE = 3;
    const MAX_ANCHOR_EXACT_RATIO = 0.40; // Max 40% of any single anchor text
    const MAX_POST_LINKS_TOTAL = 3;
    let totalStoreLinks = 0;

    // ── Step 1: Heading ID Injection (for TOC anchors) ─────────────────
    let idCounter = 0;
    processedHtml = processedHtml.replace(/<(h[23])([^>]*)>(.*?)<\/h\1>/gi, (_, tag, attrs, text) => {
        const id = `section-${idCounter++}`;
        return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
    });

    // ── Step 2: Phase 4 — Dynamic Anchor Optimization ─────────────────
    const discountPrefixes = ['كود خصم', 'كوبون', 'كوبون خصم', 'عروض', 'تخفيضات', 'تخفيض', 'قسيمة'];
    const sortedStores = [...allStores].sort((a, b) => b.name.length - a.name.length);

    sortedStores.forEach(store => {
        let storeLinkCount = 0;
        const namesToMatch: string[] = [store.name, store.slug, (store as any).nameEn]
            .filter((n): n is string => Boolean(n) && n.length >= 3);

        namesToMatch.forEach(name => {
            if (storeLinkCount >= MAX_LINKS_PER_STORE) return;

            const prefixRegexStr = discountPrefixes.map(escapeRegex).join('|');
            const regex = new RegExp(
                `(?<!<a[^>]*>)(?:(?:${prefixRegexStr})\\s+)?\\b${escapeRegex(name)}\\b(?!<\\/a>)`,
                'gi'
            );

            processedHtml = processedHtml.replace(regex, (match) => {
                if (storeLinkCount >= MAX_LINKS_PER_STORE) return match;

                const anchorText = match.trim().toLowerCase();

                // Phase 4: Enforce 40% max ratio for any single anchor pattern
                const currentCount = anchorVariations[anchorText] || 0;
                const totalSoFar = totalStoreLinks || 1;
                if (currentCount / totalSoFar > MAX_ANCHOR_EXACT_RATIO && currentCount > 0) {
                    return match; // Skip — would create over-optimized anchor cluster
                }

                storeLinkCount++;
                totalStoreLinks++;
                detectedStoreIds.add(store.id);
                anchorVariations[anchorText] = (anchorVariations[anchorText] || 0) + 1;

                return `<a href="/${countryCode}/${store.slug}" class="text-blue-600 underline font-bold transition-colors hover:text-blue-800" title="عروض ${match.trim()}">${match.trim()}</a>`;
            });
        });
    });

    // ── Step 3: Phase 7 — Auto Topical Cluster Building ───────────────
    let postLinkCount = 0;
    const currentPostSlug = post?.slug;

    if (allPosts && allPosts.length > 0 && currentPostSlug) {
        const keywordMap = new Map<string, BlogPost>();
        const candidatePosts = allPosts.filter(p => p.slug !== currentPostSlug && p.status === 'published');

        for (const otherPost of candidatePosts) {
            if (otherPost.aiDetectedKeywords && otherPost.aiDetectedKeywords.length > 0) {
                // Score candidate posts: prefer high-intent, recently updated posts
                const postIntentScore = otherPost.aiIntentType === 'transactional' ? 3
                    : otherPost.aiIntentType === 'commercial' ? 2
                        : 1;

                // Only map top 3 keywords per post, prioritized by intent
                otherPost.aiDetectedKeywords
                    .slice(0, 3 + postIntentScore) // Higher intent = more keywords eligible
                    .forEach(kw => {
                        if (kw.length >= 4 && !keywordMap.has(kw.toLowerCase())) {
                            keywordMap.set(kw.toLowerCase(), otherPost);
                        }
                    });
            }
        }

        // Process keywords longest-first to match compound phrases before short words
        const sortedKeywords = Array.from(keywordMap.keys()).sort((a, b) => b.length - a.length);

        for (const kw of sortedKeywords) {
            if (postLinkCount >= MAX_POST_LINKS_TOTAL) break;

            const targetPost = keywordMap.get(kw)!;
            const regex = new RegExp(`(?<!<a[^>]*>)\\b${escapeRegex(kw)}\\b(?!<\\/a>)`, 'gi');

            let matchedInThisKw = false;
            processedHtml = processedHtml.replace(regex, (match) => {
                if (postLinkCount >= MAX_POST_LINKS_TOTAL || matchedInThisKw) return match;

                matchedInThisKw = true;
                postLinkCount++;

                const anchorText = match.toLowerCase();
                anchorVariations[anchorText] = (anchorVariations[anchorText] || 0) + 1;

                return `<a href="/${countryCode}/blog/${targetPost.slug}" class="text-indigo-600 underline font-semibold transition-colors hover:text-indigo-800" title="اقرأ المزيد عن: ${targetPost.title}">${match}</a>`;
            });
        }
    }

    // ── Step 4: Phase 3 — Compute Behavioral Injection Score ──────────
    const paragraphCount = (processedHtml.match(/<p>/gi) || []).length;
    const { blockIndex, breakdown } = post
        ? computeInjectionScore(post, paragraphCount)
        : { blockIndex: Math.min(2, paragraphCount), breakdown: 'fallback_no_post' };

    // ── Step 5: Compute Anchor Diversity Score ─────────────────────────
    const anchorDiversityScore = computeAnchorDiversityScore(anchorVariations);

    return {
        processedHtml,
        detectedStoreIds: Array.from(detectedStoreIds),
        anchorVariations,
        anchorDiversityScore,
        optimalInjectionIndex: blockIndex,
        injectionScoreBreakdown: breakdown,
        paragraphCount
    };
}

// ────────────────────────────────────────────────────────────────────────────────
// TOC EXTRACTOR
// ────────────────────────────────────────────────────────────────────────────────
export function extractToc(content: string) {
    const regex = /<h([23])([^>]*)>(.*?)<\/h\1>/gi;
    let match;
    const toc = [];
    let i = 0;
    while ((match = regex.exec(content)) !== null) {
        const level = parseInt(match[1]);
        const text = match[3].replace(/<[^>]*>?/gm, '');
        toc.push({ id: `section-${i++}`, text, level });
    }
    return toc;
}
