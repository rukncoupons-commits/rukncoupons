/**
 * ═══════════════════════════════════════════════════════════════════
 *  PHASE 8: FIRESTORE BEHAVIORAL DATA MIGRATION
 *  POST /api/admin/migrate-behavioral-schema
 * ═══════════════════════════════════════════════════════════════════
 *
 *  One-time migration script that upgrades all existing `blogPosts`
 *  documents from the old thin schema to the new granular Phase 8 schema.
 *
 *  Run once after deployment by visiting:
 *  POST /api/admin/migrate-behavioral-schema
 *  (Admin-only, protected by admin_token cookie)
 *
 *  What it does:
 *  - Adds all missing Phase 8 fields with safe defaults
 *  - Migrates old `conversion_hotspots: Record<number, number>` keys
 *    to string keys (Firestore native format)
 *  - Preserves any existing avg_scroll_depth and total_sessions data
 *  - Skips posts that already have the new schema (idempotent)
 * ═══════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    // Require admin auth
    const token = req.cookies.get('admin_token')?.value;
    if (token !== 'valid_session') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const snapshot = await adminDb.collection('blogPosts').get();
        let migrated = 0;
        let skipped = 0;
        let errors = 0;
        const errorLog: string[] = [];

        for (const doc of snapshot.docs) {
            try {
                const data = doc.data();
                const existing = data.behavioral_data;

                // Already on new schema if `scroll_histogram` exists
                if (existing?.scroll_histogram !== undefined) {
                    skipped++;
                    continue;
                }

                const now = new Date().toISOString();

                // Preserve any existing data, fill gaps with safe defaults
                const oldSessions = existing?.total_sessions ?? 0;
                const oldScrollAvg = existing?.avg_scroll_depth ?? 0;
                const oldOptimalIndex = existing?.optimal_injection_index ?? 2;
                const oldConfidence = existing?.injection_confidence ?? 0;
                const oldMobileIdx = existing?.mobile_optimal_index ?? 2;
                const oldDesktopIdx = existing?.desktop_optimal_index ?? 2;
                const oldFirstTracked = existing?.first_tracked ?? now;
                const oldLastUpdated = existing?.last_updated ?? now;

                // Migrate conversion_hotspots: convert number keys → string keys
                const newHotspots: Record<string, number> = {};
                if (existing?.conversion_hotspots) {
                    for (const [k, v] of Object.entries(existing.conversion_hotspots)) {
                        newHotspots[String(k)] = Number(v);
                    }
                }

                // Reconstruct a minimal scroll histogram from the existing avg
                // If we know avg_scroll_depth = 0.65, we can infer at least 65% buckets 0-6 were reached
                const scroll_histogram: Record<string, number> = {};
                if (oldSessions > 0 && oldScrollAvg > 0) {
                    const bucketReached = Math.floor(oldScrollAvg * 10);
                    for (let b = 0; b <= Math.min(bucketReached, 9); b++) {
                        scroll_histogram[b.toString()] = Math.round(oldSessions * (1 - b * 0.08));
                    }
                }

                const newSchema = {
                    total_sessions: oldSessions,
                    total_desktop_sessions: Math.round(oldSessions * 0.6), // Estimated split until real data arrives
                    total_mobile_sessions: Math.round(oldSessions * 0.4),
                    avg_scroll_depth: oldScrollAvg,
                    scroll_histogram,
                    paragraph_engagement: {},
                    conversion_hotspots: newHotspots,
                    exit_paragraph_distribution: {},
                    optimal_injection_index: oldOptimalIndex,
                    mobile_optimal_index: oldMobileIdx,
                    desktop_optimal_index: oldDesktopIdx,
                    injection_confidence: oldConfidence,
                    avg_time_on_page: 0,
                    referrer_segments: {},
                    ab_trials: [],
                    first_tracked: oldFirstTracked,
                    last_updated: oldLastUpdated,
                };

                await doc.ref.update({ behavioral_data: newSchema });
                migrated++;

            } catch (docError: any) {
                errors++;
                errorLog.push(`${doc.id}: ${docError.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: snapshot.docs.length,
                migrated,
                skipped,
                errors,
            },
            errors: errorLog,
            migratedAt: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Migration failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
