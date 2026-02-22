import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * 
 * Health check endpoint for Google Cloud Run readiness probe.
 * Cloud Run uses this to determine if the container is healthy.
 * Also used by the Dockerfile HEALTHCHECK command.
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'rukncoupons',
    }, { status: 200 });
}
