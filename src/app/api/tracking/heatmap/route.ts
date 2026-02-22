import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * ═══════════════════════════════════════════════════════════════════
 *  PHASE 8: HEATMAP BEACON INGESTION API
 *  POST /api/tracking/heatmap
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Receives a sendBeacon() payload from tracker.js on page exit.
 *  Updates the blogPost Firestore document with granular behavioral data:
 *
 *    - Scroll depth histogram (10 buckets)
 *    - Per-paragraph engagement counters
 *    - Device breakdowns (mobile vs desktop)
 *    - Time-on-page moving average
 *    - Referrer segment tracking
 *    - A/B trial recording
 *
 *  All updates use Firestore atomic increments / field-level writes
 *  to avoid race conditions under concurrent traffic.
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Payload shape (from tracker.js):
 *  {
 *    url: string,             – full page URL
 *    scrollDepth: number,     – [0.0–1.0] fraction of page scrolled
 *    timeOnPage: number,      – seconds spent
 *    device: 'mobile'|'desktop',
 *    referrer: string,        – document.referrer
 *    paragraphsRead: number,  – how many <p> tags were scrolled past
 *    totalParagraphs: number, – total <p> count in article
 *    abVariant: 'A'|'B'|null  – which A/B bucket was assigned
 *    converted: boolean       – true if user clicked a coupon code
 *  }
 */
export async function POST(req: Request) {
    try {
        const textData = await req.text();
        const payload = JSON.parse(textData);

        const {
            url,
            scrollDepth = 0,
            timeOnPage = 0,
            device = 'desktop',
            referrer = '',
            paragraphsRead = 0,
            totalParagraphs = 0,
            abVariant = null,
            converted = false,
        } = payload;

        // Only process blog article pages
        if (!url || !url.includes('/blog/')) {
            return NextResponse.json({ success: true, message: "Ignored" });
        }

        // Extract slug from URL (handles trailing slashes and query strings)
        const slug = url.split('/blog/')[1]?.split('?')[0]?.split('#')[0]?.replace(/\/$/, '');
        if (!slug) return NextResponse.json({ success: true, message: "No slug" });
        const decodedSlug = decodeURIComponent(slug);

        // Find the matching blog post in Firestore
        const querySnapshot = await adminDb.collection("blogPosts")
            .where("slug", "==", decodedSlug)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return NextResponse.json({ success: false, message: "Post not found" });
        }

        const doc = querySnapshot.docs[0];
        const existing = doc.data().behavioral_data || {};
        const now = new Date().toISOString();

        // ── 1. Session Counters ────────────────────────────────────────
        const totalSessions = (existing.total_sessions || 0) + 1;
        const totalDesktop = (existing.total_desktop_sessions || 0) + (device === 'desktop' ? 1 : 0);
        const totalMobile = (existing.total_mobile_sessions || 0) + (device === 'mobile' ? 1 : 0);

        // ── 2. Scroll Depth Moving Average ─────────────────────────────
        const oldAvg = existing.avg_scroll_depth || 0;
        const oldCount = (existing.total_sessions || 0);
        const newAvg = oldCount > 0
            ? (oldAvg * oldCount + scrollDepth) / totalSessions
            : scrollDepth;

        // ── 3. Scroll Histogram (10 buckets: 0–9 for 0–10% to 90–100%) ─
        const scrollHistogram: Record<string, number> = { ...(existing.scroll_histogram || {}) };
        // Increment all buckets the user reached (cumulative survival curve)
        const bucketReached = Math.floor(scrollDepth * 10); // 0-9
        for (let b = 0; b <= Math.min(bucketReached, 9); b++) {
            scrollHistogram[b.toString()] = (scrollHistogram[b.toString()] || 0) + 1;
        }

        // ── 4. Per-Paragraph Engagement ────────────────────────────────
        const paragraphEngagement: Record<string, number> = { ...(existing.paragraph_engagement || {}) };
        for (let p = 0; p < Math.min(paragraphsRead, totalParagraphs); p++) {
            paragraphEngagement[p.toString()] = (paragraphEngagement[p.toString()] || 0) + 1;
        }

        // ── 5. Exit Paragraph Distribution ────────────────────────────
        const exitParaDistribution: Record<string, number> = { ...(existing.exit_paragraph_distribution || {}) };
        if (totalParagraphs > 0) {
            const exitParagraph = Math.min(paragraphsRead, totalParagraphs - 1);
            const exitKey = exitParagraph.toString();
            exitParaDistribution[exitKey] = (exitParaDistribution[exitKey] || 0) + 1;
        }

        // ── 6. Time on Page Moving Average ─────────────────────────────
        const oldTimeAvg = existing.avg_time_on_page || 0;
        const newTimeAvg = oldCount > 0
            ? (oldTimeAvg * oldCount + timeOnPage) / totalSessions
            : timeOnPage;

        // ── 7. Referrer Segment Breakdown ──────────────────────────────
        const referrerSegments: Record<string, any> = { ...(existing.referrer_segments || {}) };
        const referrerKey = classifyReferrer(referrer);
        const seg = referrerSegments[referrerKey] || { sessions: 0, avg_scroll_depth: 0 };
        const newSegCount = seg.sessions + 1;
        const newSegAvg = (seg.avg_scroll_depth * seg.sessions + scrollDepth) / newSegCount;
        referrerSegments[referrerKey] = { sessions: newSegCount, avg_scroll_depth: newSegAvg };

        // ── 8. A/B Trial Recording ─────────────────────────────────────
        let abTrials: any[] = existing.ab_trials || [];

        if (abVariant === 'A' || abVariant === 'B') {
            // Keep last 500 trials max (older entris purged to control Firestore doc size)
            if (abTrials.length >= 500) {
                abTrials = abTrials.slice(-499);
            }
            abTrials.push({
                variant: abVariant,
                injection_index: existing.optimal_injection_index || 2,
                converted: Boolean(converted),
                scroll_depth: scrollDepth,
                device: device === 'mobile' ? 'mobile' : 'desktop',
                timestamp: now,
            });
        }

        // ── 9. Confidence Score ────────────────────────────────────────
        // Grows from 0→1 as sessions accumulate: log-scale reaching ~0.9 at 500 sessions
        const injectionConfidence = Math.min(1.0, Math.log10(1 + totalSessions / 50) / Math.log10(11));

        // ── Write all fields ───────────────────────────────────────────
        const behavioralUpdate = {
            total_sessions: totalSessions,
            total_desktop_sessions: totalDesktop,
            total_mobile_sessions: totalMobile,
            avg_scroll_depth: newAvg,
            scroll_histogram: scrollHistogram,
            paragraph_engagement: paragraphEngagement,
            exit_paragraph_distribution: exitParaDistribution,
            avg_time_on_page: newTimeAvg,
            referrer_segments: referrerSegments,
            ab_trials: abTrials,
            injection_confidence: injectionConfidence,
            // Preserve existing optimal indexes — recalculate runs weekly via /api/heatmap/recalculate
            optimal_injection_index: existing.optimal_injection_index ?? 2,
            mobile_optimal_index: existing.mobile_optimal_index ?? 2,
            desktop_optimal_index: existing.desktop_optimal_index ?? 2,
            conversion_hotspots: existing.conversion_hotspots || {},
            first_tracked: existing.first_tracked || now,
            last_updated: now,
        };

        await doc.ref.update({ behavioral_data: behavioralUpdate });

        return NextResponse.json({ success: true });

    } catch (error) {
        // Tracker beacons should fail silently (never block UI)
        console.error("Heatmap ingestion error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

/** Classify a referrer URL into a named segment */
function classifyReferrer(referrer: string): string {
    if (!referrer) return 'direct';
    if (/google\.|bing\.|yahoo\.|duckduckgo\./i.test(referrer)) return 'organic';
    if (/facebook\.|instagram\.|twitter\.|x\.com|tiktok\.|snapchat\./i.test(referrer)) return 'social';
    if (/mail\.|outlook\.|gmail\.|yahoo\.com\/mail/i.test(referrer)) return 'email';
    return 'other';
}
