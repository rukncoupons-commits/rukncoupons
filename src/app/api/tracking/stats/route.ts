import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * PHASE 9: /api/tracking/stats
 * 
 * Returns aggregated behavioral heatmap data for all blog posts,
 * used by the Admin Tracking Dashboard to display analytics.
 */
export async function GET() {
    try {
        const querySnapshot = await adminDb.collection('blogPosts')
            .where('status', '==', 'published')
            .get();

        const posts: any[] = [];

        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            if (data.behavioral_data) {
                posts.push({
                    postSlug: data.slug,
                    title: data.title,
                    avg_scroll_depth: data.behavioral_data.avg_scroll_depth || 0,
                    total_sessions: data.behavioral_data.total_sessions || 0,
                    optimal_injection_index: data.behavioral_data.optimal_injection_index || 0,
                    mobile_optimal_index: data.behavioral_data.mobile_optimal_index || 0,
                    desktop_optimal_index: data.behavioral_data.desktop_optimal_index || 0,
                    injection_confidence: data.behavioral_data.injection_confidence || 0,
                    last_updated: data.behavioral_data.last_updated || null,
                    ab_variant: data.behavioral_data.ab_variant || null,
                });
            }
        }

        // Sort by total sessions descending
        posts.sort((a, b) => b.total_sessions - a.total_sessions);

        return NextResponse.json({ posts, total: posts.length });

    } catch (error) {
        console.error('Stats API error:', error);
        return NextResponse.json({ posts: [], error: 'Failed to fetch stats' }, { status: 500 });
    }
}
