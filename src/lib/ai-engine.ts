import { BlogPost, Store, Coupon } from "./types";

// ---------------------------------------------------------------------------
// Phase 1: Search Intent Classifier
// ---------------------------------------------------------------------------

export type IntentType = 'transactional' | 'commercial' | 'informational' | 'navigational';

export interface IntentResult {
    type: IntentType;
    score: number;       // 0-100
    commercialWeight: number; // 0-100
    keywords: string[];
}

const INTENT_DICTIONARIES = {
    transactional: ['كود خصم', 'كوبون', 'عرض', 'خصم', 'تخفيض', 'وفر', 'promo code', 'discount', 'coupon'],
    commercial: ['أفضل', 'مقارنة', 'مراجعة', 'تقييم', 'اسعار', 'ارخص', 'best', 'review', 'vs', 'compare'],
    informational: ['كيفية', 'طريقة', 'دليل', 'شرح', 'ما هو', 'متى', 'how to', 'guide', 'what is'],
};

// Basic Arabic normalization
export function normalizeArabic(text: string): string {
    return text
        .replace(/[أإآا]/g, 'ا')
        .replace(/[ة]/g, 'ه')
        .replace(/[ى]/g, 'ي')
        .replace(/[ًٌٍَُِّْ]/g, '') // remove diacritics
        .toLowerCase()
        .trim();
}

export function detectSearchIntent(content: string, title: string): IntentResult {
    const combinedText = normalizeArabic(`${title} ${title} ${content}`); // Weight title heavier
    const words = combinedText.split(/\s+/);

    let scores = { transactional: 0, commercial: 0, informational: 0 };
    let foundKeywords: string[] = [];

    // Simple frequency matching
    Object.entries(INTENT_DICTIONARIES).forEach(([intent, triggers]) => {
        triggers.forEach(trigger => {
            const normalizedTrigger = normalizeArabic(trigger);
            const regex = new RegExp(`\\b${normalizedTrigger}\\b`, 'gi');
            const matches = combinedText.match(regex);

            if (matches) {
                scores[intent as keyof typeof scores] += matches.length;
                if (!foundKeywords.includes(trigger)) foundKeywords.push(trigger);
            }
        });
    });

    const totalScore = scores.transactional + scores.commercial + scores.informational;

    // Default to informational if no clear signal
    if (totalScore === 0) {
        return { type: 'informational', score: 50, commercialWeight: 10, keywords: [] };
    }

    // Determine primary intent
    let primaryIntentStr = 'informational';
    let maxScore = 0;

    Object.entries(scores).forEach(([intent, score]) => {
        if (score > maxScore) {
            maxScore = score;
            primaryIntentStr = intent;
        }
    });

    const primaryIntent = primaryIntentStr as IntentType;

    // Calculate Confidence Score (0-100)
    const confidenceScore = Math.min(Math.round((maxScore / totalScore) * 100), 100);

    // Calculate Commercial Weight
    let commercialWeight = 0;
    if (primaryIntent === 'transactional') commercialWeight = 90;
    else if (primaryIntent === 'commercial') commercialWeight = 70;
    else if (primaryIntent === 'informational') commercialWeight = 20;

    return {
        type: primaryIntent,
        score: confidenceScore,
        commercialWeight,
        keywords: foundKeywords.slice(0, 10), // Limit to top 10 detected
    };
}

// ---------------------------------------------------------------------------
// Phase 2: Keyword -> Store Matching Engine
// ---------------------------------------------------------------------------

export interface MatchedStore extends Store {
    matchConfidence: number;
}

export function matchStoresToContent(content: string, title: string, availableStores: Store[], countryCode: string): MatchedStore[] {
    const normalizedText = normalizeArabic(`${title} ${content}`);
    let matches: MatchedStore[] = [];

    availableStores.forEach(store => {
        const storeNameEn = (store as any).nameEn || "";
        const storeNames = [store.name, store.slug, ...(storeNameEn ? [storeNameEn] : [])]
            .map(n => normalizeArabic(n))
            .filter(n => n.length > 2); // Avoid matching tiny generic words

        let matchCount = 0;
        storeNames.forEach(name => {
            const regex = new RegExp(`\\b${name}\\b`, 'gi');
            const found = normalizedText.match(regex);
            if (found) matchCount += found.length;
        });

        if (matchCount > 0) {
            // Ranking Formula (Simplified Phase 2)
            // Prioritize exact country match, then fall back to global if store allows.
            let confidence = Math.min(matchCount * 20, 100); // Base text match

            // Boost if the store is highly converting (dummy metric for now based on offers count)
            const offersBoost = Math.min(((store as any).offersCount || 0) * 2, 20);

            matches.push({
                ...store,
                matchConfidence: Math.min(confidence + offersBoost, 100)
            });
        }
    });

    // Sort by confidence descending
    return matches.sort((a, b) => b.matchConfidence - a.matchConfidence).slice(0, 3); // Return top 3
}

// ---------------------------------------------------------------------------
// Phase 6: Monetization Priority Engine
// ---------------------------------------------------------------------------

export function rankCoupons(coupons: Coupon[], intentType: IntentType): Coupon[] {
    if (!coupons || coupons.length === 0) return [];

    return [...coupons].sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Factor 1: Verified/Active
        if (a.isVerified) scoreA += 50;
        if (b.isVerified) scoreB += 50;

        // Factor 2: Exclusive
        if (a.isExclusive) scoreA += 30;
        if (b.isExclusive) scoreB += 30;

        // Factor 3: Offer Type (assuming custom types or 'coupon' vs 'deal')
        const aType = typeof a.type === 'string' ? a.type : '';
        const bType = typeof b.type === 'string' ? b.type : '';
        if (aType === 'coupon') scoreA += 20;
        if (bType === 'coupon') scoreB += 20;

        // Intent Specific Tweaks
        if (intentType === 'transactional') {
            // Boost coupons with highest % or clear monetary value
            // (Requires parsing title/description for numbers, omitted here for brevity)
        }

        return scoreB - scoreA;
    });
}

// ---------------------------------------------------------------------------
// Phase 4: Dynamic Anchor Optimization
// ---------------------------------------------------------------------------

const ANCHOR_TEMPLATES = [
    "أحدث كوبونات {storeName}",
    "عرض {storeName} الحالي",
    "وفر الآن مع {storeName}",
    "خصومات متجر {storeName}",
    "كود خصم {storeName} الفعال",
    "تخفيضات {storeName} الحصرية",
];

export function generateDynamicAnchor(storeName: string, index: number): string {
    const template = ANCHOR_TEMPLATES[index % ANCHOR_TEMPLATES.length];
    return template.replace('{storeName}', storeName);
}
