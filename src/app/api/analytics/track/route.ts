import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// In-memory rate limiting map for edge/serverless (resets on cold start, but good enough for basic burst protection)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 60; // Max events per IP per minute
const RATE_LIMIT_WINDOW_MS = 60000;

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();

        // Basic Bot Protection & Rate Limiting
        const limitData = rateLimitMap.get(ip);
        if (limitData) {
            if (now > limitData.resetTime) {
                rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
            } else {
                limitData.count++;
                if (limitData.count > RATE_LIMIT_MAX) {
                    return new NextResponse(null, { status: 429 }); // Too Many Requests
                }
            }
        } else {
            rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        }

        const body = await request.json();

        // Handle Web Vitals (RUM) Stream
        if (body.event === 'web_vitals') {
            adminDb.collection('core_web_vitals').add({
                timestamp: new Date(),
                metric: body.data.name,
                value: body.data.value,
                rating: body.data.rating,
                delta: body.data.delta,
                country: body.data.country || 'unknown',
                url: body.data.url,
            }).catch(err => console.error('Failed to log CWV:', err));
            return NextResponse.json({ success: true });
        }

        // Ensure required fields for standard events
        if (!body.event_type || !body.url) {
            return new NextResponse(null, { status: 400 });
        }

        // Drop obvious bots by missing vital headers or explicitly declared tools
        const userAgent = request.headers.get('user-agent') || '';
        if (userAgent.toLowerCase().includes('bot') || userAgent.toLowerCase().includes('crawler')) {
            return new NextResponse(null, { status: 200 }); // "Success" to bot, but we drop it
        }

        const eventData = {
            session_id: body.session_id || 'anonymous',
            timestamp: new Date(),
            event_type: body.event_type,
            url: body.url,
            country: body.country || 'unknown',
            device: body.device || 'desktop',
            source: body.source || 'direct',
            metadata: {
                coupon_id: body.metadata?.coupon_id || null,
                store_id: body.metadata?.store_id || null,
                position: body.metadata?.position || null,
                time_to_click_ms: body.metadata?.time_to_click_ms || null,
                scroll_depth_pct: body.metadata?.scroll_depth_pct || null,
            }
        };

        // Fire & Forget to Firestore (Raw Event Stream)
        adminDb.collection('analytics_events').add(eventData).catch(err => {
            console.error('Failed to log analytics event:', err);
        });

        // Always return 200 immediately (non-blocking)
        return NextResponse.json({ success: true });

    } catch (error) {
        // Fail silently so client-side beacon doesn't log errors to user console
        return new NextResponse(null, { status: 500 });
    }
}
