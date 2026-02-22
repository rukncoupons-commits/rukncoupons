import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    // Use precisely the same logic as the middleware to ensure consistency
    // but we can trust the middleware's injected header x-detected-country 
    // if it's there. 

    const detectedCountry = request.headers.get('x-detected-country');

    if (detectedCountry) {
        return NextResponse.json({ country: detectedCountry });
    }

    // Fallback detection (if bypass paths like /api were hit, the header might be missing 
    // because we skipped middleware logic for /api... oh wait!
    // In middleware, I bypassed /api! 
    // Let's do the manual check here.

    const cfCountry = request.headers.get('CF-IPCountry');
    const vercelCountryHeaders = request.headers.get('x-vercel-ip-country');

    // @ts-ignore
    const vercelGeoCountry = request.geo?.country;

    const finalCountry = (
        cfCountry ||
        vercelCountryHeaders ||
        vercelGeoCountry ||
        'sa'
    ).toLowerCase();

    return NextResponse.json({ country: finalCountry });
}
