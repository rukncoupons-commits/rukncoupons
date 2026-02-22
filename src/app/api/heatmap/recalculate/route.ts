import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * ═══════════════════════════════════════════════════════════════════
 *  PHASE 9: AI SELF-LEARNING LOOP — Weekly Batch Recalculation
 *  POST /api/heatmap/recalculate
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Auth: Accepts either:
 *    1. admin_token cookie (manual trigger from Admin Dashboard)
 *    2. Authorization: Bearer <CRON_SECRET> header (Vercel Cron automatic)
 *
 *  VERCEL CRON sets Authorization: Bearer <VERCEL_CRON_SECRET> automatically.
 *  The CRON_SECRET env var must match what Vercel sends.
 *
 *  Runs every Monday at 3:00 AM UTC (configured in vercel.json):
 *    "schedule": "0 3 * * 1"
 */
export async function POST(req: NextRequest) {
    // ── Auth: Admin cookie or Vercel Cron secret ───────────────────
    const cookieToken = req.cookies.get('admin_token')?.value;
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isAdminUser = cookieToken === 'valid_session';

    if (!isAdminUser && !isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const snapshot = await adminDb.collection('blogPosts').get();
        let updatedCount = 0;
        let skippedCount = 0;
        const now = new Date().toISOString();

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const b = data.behavioral_data;

            if (!b || !b.total_sessions || b.total_sessions < 20) {
                skippedCount++;
                continue;
            }

            const avgScroll = b.avg_scroll_depth || 0;
            const totalSessions = b.total_sessions || 0;
            const wordCount = (data.content || '').split(/\s+/).length;
            const estimatedParagraphs = Math.max(4, Math.ceil(wordCount / 50));

            // Intent weight
            const intentType = data.aiIntentType;
            let intentWeight = 0.5;
            if (intentType === 'transactional') intentWeight = 1.0;
            else if (intentType === 'commercial') intentWeight = 0.8;
            else if (intentType === 'informational') intentWeight = 0.3;

            const desktopDepth = Math.min(Math.max(avgScroll * 0.8, 0.20), 0.70);
            const mobileDepth = Math.min(Math.max(avgScroll * 0.8, 0.25), 0.45);
            const baseMobileIdx = Math.max(1, Math.floor(estimatedParagraphs * mobileDepth));

            // Re-score using real per-paragraph CTR data
            const paraEngagement: Record<string, number> = b.paragraph_engagement || {};
            const convHotspots: Record<string, number> = b.conversion_hotspots || {};

            let bestScore = -1;
            let bestDesktopIdx = Math.max(1, Math.floor(estimatedParagraphs * desktopDepth));

            for (let i = 1; i < estimatedParagraphs; i++) {
                const paEngaged = paraEngagement[String(i)] || 0;
                const scrollSurvival = totalSessions > 0 ? paEngaged / totalSessions : 0;
                const histCTR = (paEngaged > 0 && convHotspots[String(i)])
                    ? convHotspots[String(i)] / paEngaged
                    : 0;
                const distance = Math.abs(i - Math.floor(estimatedParagraphs * desktopDepth));
                const distancePenalty = Math.max(0, 1 - distance * 0.25);
                const score = (0.40 * intentWeight) + (0.40 * distancePenalty * scrollSurvival) + (0.20 * histCTR);
                if (score > bestScore) { bestScore = score; bestDesktopIdx = i; }
            }

            // Confidence — log10 scale
            const confidence = Math.min(1.0, Math.log10(1 + totalSessions / 50) / Math.log10(11));

            // A/B Summary
            const trials: any[] = b.ab_trials || [];
            let aT = 0, aC = 0, aS = 0, bT = 0, bC = 0, bS = 0;
            for (const t of trials) {
                if (t.variant === 'A') { aT++; if (t.converted) aC++; aS += t.scroll_depth || 0; }
                else if (t.variant === 'B') { bT++; if (t.converted) bC++; bS += t.scroll_depth || 0; }
            }
            const cvrA = aT > 0 ? aC / aT : 0;
            const cvrB = bT > 0 ? bC / bT : 0;
            const maxCvr = Math.max(cvrA, cvrB);
            let winner: 'A' | 'B' | 'tie' = 'tie';
            let abConf = 0;
            if (maxCvr > 0 && Math.abs(cvrA - cvrB) / maxCvr > 0.05) {
                winner = cvrA > cvrB ? 'A' : 'B';
                abConf = Math.min(1.0, Math.min(aT, bT) / 100);
            }

            await doc.ref.update({
                'behavioral_data.optimal_injection_index': bestDesktopIdx,
                'behavioral_data.desktop_optimal_index': bestDesktopIdx,
                'behavioral_data.mobile_optimal_index': Math.max(1, baseMobileIdx),
                'behavioral_data.injection_confidence': confidence,
                'behavioral_data.ab_summary': {
                    variant_A: { sessions: aT, conversions: aC, cvr: cvrA, avg_scroll: aT > 0 ? aS / aT : 0 },
                    variant_B: { sessions: bT, conversions: bC, cvr: cvrB, avg_scroll: bT > 0 ? bS / bT : 0 },
                    winner,
                    confidence: abConf,
                },
                'behavioral_data.last_updated': now,
            });

            updatedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Re-scored ${updatedCount} articles. Skipped ${skippedCount} (insufficient data).`,
            updatedAt: now,
            triggeredBy: isVercelCron ? 'vercel-cron' : 'admin',
        });

    } catch (error: any) {
        console.error('Self-learning loop error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
