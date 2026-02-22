import { BlogPost } from "./types";

export interface InjectionScore {
    blockIndex: number;
    score: number;
    reason: string;
}

/**
 * PHASE 2 & 3: HEATMAP MODELING AND PLACEMENT SCORING
 * 
 * Calculates the optimal DOM paragraph index to inject the localized SSR component based on
 * the historical scroll decay curve, the article's intent weight, and proven conversion CTRs.
 */
export function calculateOptimalInjectionZone(
    post: BlogPost,
    totalParagraphs: number,
    isMobile: boolean = false
): InjectionScore[] {
    const data = post.behavioral_data;

    // Default fallback if no behavioral data exists: inject after 2nd paragraph
    if (!data || data.total_sessions === 0 || !data.avg_scroll_depth) {
        return [{ blockIndex: Math.min(2, totalParagraphs), score: 0.5, reason: 'fallback_no_data' }];
    }

    const avgScroll = data.avg_scroll_depth;

    // We target injection just before the average drop-off cliff
    let targetDepth = avgScroll * 0.8;

    // Mobile Safeguards (Avoid Above-the-fold overload or Deep-scroll abandonment)
    if (isMobile) {
        targetDepth = Math.min(targetDepth, 0.45); // Cap at 45% depth
        targetDepth = Math.max(targetDepth, 0.25); // Minimum 25% depth
    }

    // Transform scroll percentage depth into DOM index
    const baseTargetIndex = Math.floor(totalParagraphs * targetDepth);

    // Generate a probability matrix for surrounding paragraphs
    // A sliding window of +/- 2 paragraphs around the target depth
    const candidateIndices = [
        baseTargetIndex - 2,
        baseTargetIndex - 1,
        baseTargetIndex,
        baseTargetIndex + 1,
        baseTargetIndex + 2
    ].filter(i => i >= 1 && i < totalParagraphs); // Ensure indices exist and are not paragraph 0


    // Variables from Phase 1 Intent Classifier
    let intentWeight = 0.5;
    if (post.aiIntentType === 'transactional') intentWeight = 1.0;
    if (post.aiIntentType === 'commercial') intentWeight = 0.8;
    if (post.aiIntentType === 'informational') intentWeight = 0.3;

    const scoredCandidates: InjectionScore[] = candidateIndices.map(index => {
        // Calculate Distance Penalty (how far from the mathematical optimal scroll point)
        const distance = Math.abs(index - baseTargetIndex);
        const scrollProbability = Math.max(0, 1 - (distance * 0.2));

        // Bug fix: Phase 8 schema stores all hotspot keys as strings
        const histConv = data.conversion_hotspots ? (data.conversion_hotspots[String(index)] || 0) : 0;

        // Final Algorithm Formula
        const w1 = 0.4 * intentWeight;     // Intent relevance factor
        const w2 = 0.4 * scrollProbability;// Traffic volume survival at this depth
        const w3 = 0.2 * histConv;         // Proven historical conversion

        const finalScore = w1 + w2 + w3;

        return {
            blockIndex: index,
            score: finalScore,
            reason: `D:${distance}, W1:${w1.toFixed(2)}, W2:${w2.toFixed(2)}, W3:${w3.toFixed(2)}`
        };
    });

    // Sort heavily by highest prediction score
    return scoredCandidates.sort((a, b) => b.score - a.score);
}
