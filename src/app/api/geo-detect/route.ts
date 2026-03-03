import { NextResponse } from 'next/server';

export const runtime = 'edge';

const SUPPORTED_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];

export async function GET(request: Request) {
    // 1. Check middleware-injected header first
    const detectedCountry = request.headers.get('x-detected-country');
    if (detectedCountry && SUPPORTED_COUNTRIES.includes(detectedCountry.toLowerCase())) {
        return NextResponse.json({ country: detectedCountry.toLowerCase() });
    }

    // 2. Try CDN geo headers (CF / Vercel)
    const cfCountry = request.headers.get('CF-IPCountry');
    const vercelCountryHeaders = request.headers.get('x-vercel-ip-country');
    // @ts-ignore - geo is available in Vercel edge
    const vercelGeoCountry = request.geo?.country;

    const cdnCountry = (cfCountry || vercelCountryHeaders || vercelGeoCountry || '').toLowerCase();

    if (cdnCountry && SUPPORTED_COUNTRIES.includes(cdnCountry)) {
        return NextResponse.json({ country: cdnCountry });
    }

    // 3. Fallback: use external geo API when CDN headers are unavailable
    try {
        const geoRes = await fetch('https://get.geojs.io/v1/ip/country.json', {
            signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
            const geoData = await geoRes.json();
            const externalCountry = (geoData.country || '').toLowerCase();
            if (externalCountry && SUPPORTED_COUNTRIES.includes(externalCountry)) {
                return NextResponse.json({ country: externalCountry });
            }
            // Country detected but not supported
            return NextResponse.json({ country: externalCountry || 'sa', supported: false });
        }
    } catch {
        // External API failed, fall through to default
    }

    return NextResponse.json({ country: 'sa' });
}
