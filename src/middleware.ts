import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    // Edge runtime is required for middleware
    runtime: 'experimental-edge',
    unstable_allowDynamic: [
        '/node_modules/function-bind/**', // use a glob to allow anything in the function-bind 3rd party module
    ],
    // Match all paths except explicit static assets
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)).*)',
    ],
};

// Supported countries mapping (lowercase for consistency)
const SUPPORTED_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];
const FALLBACK_COUNTRY = 'sa';

// SEO Safe Mode Rules
const BOT_USER_AGENTS = [
    'Googlebot', 'Bingbot', 'AhrefsBot', 'SemrushBot', 'DotBot',
    'YandexBot', 'Baiduspider', 'DuckDuckBot', 'Slurp'
];

const BYPASS_PATHS = [
    '/robots.txt',
    '/sitemap.xml',
    '/api',
    '/_next',
];

const MARKETING_PARAMS = ['utm_', 'gclid', 'fbclid'];
const SEARCH_REFERRERS = ['google.com', 'bing.com'];

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const pathname = url.pathname;

    // 1. PATH EXCLUSIONS - Fast exit for static/api routes
    if (BYPASS_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 1.5 ADMIN AUTHENTICATION
    const token = request.cookies.get("admin_token");
    const isLoginPage = pathname === "/login";
    const isAdminPage = pathname.startsWith("/admin");

    if (isAdminPage && (!token || token.value !== "valid_session")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isLoginPage && token?.value === "valid_session") {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Stop execution if we are in admin so we don't run geo logic
    if (isAdminPage || isLoginPage) {
        return NextResponse.next();
    }

    // 2. DETECT COUNTRY (Priority Order)
    const cookieCountry = request.cookies.get('country_preference')?.value;
    const cfCountry = request.headers.get('CF-IPCountry');
    const vercelCountryHeaders = request.headers.get('x-vercel-ip-country');

    // @ts-ignore - geo is available in Vercel edge
    const vercelGeoCountry = request.geo?.country;

    let detectedCountry = (
        cookieCountry ||
        cfCountry ||
        vercelCountryHeaders ||
        vercelGeoCountry ||
        FALLBACK_COUNTRY
    ).toLowerCase();

    // Validate detected country
    if (!SUPPORTED_COUNTRIES.includes(detectedCountry)) {
        detectedCountry = FALLBACK_COUNTRY;
    }

    // Clone headers to inject detection result
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-detected-country', detectedCountry);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // 3. IDENTIFY CURRENT URL COUNTRY
    // E.g., /sa/stores -> pathParts[1] is 'sa'
    const pathParts = pathname.split('/').filter(Boolean);
    const currentUrlCountry = pathParts.length > 0 ? pathParts[0].toLowerCase() : null;
    const hasCountryInUrl = currentUrlCountry && SUPPORTED_COUNTRIES.includes(currentUrlCountry);

    // 4. SEO & BOT SAFE MODE CHECKS
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = BOT_USER_AGENTS.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()));

    const hasMarketingParam = MARKETING_PARAMS.some((param) => {
        for (const key of url.searchParams.keys()) {
            if (key.toLowerCase().includes(param)) return true;
        }
        return false;
    });

    const referrer = request.headers.get('referer') || '';
    const isFromSearchEngine = SEARCH_REFERRERS.some((ref) => referrer.toLowerCase().includes(ref));

    // If Safe Mode is triggered, DO NOT redirect automatically.
    // The client-side GeoSuggestionPopup will handle showing the banner.
    const isSafeModeActive = isBot || hasMarketingParam || isFromSearchEngine;

    // 5. REDIRECT LOGIC FOR ROOT DOMAIN (/)
    if (pathname === '/') {
        // If it's a bot or marketing link, let them see the root (if root exists) or fallback
        // Actually, for root domain, we ideally want to serve the default country or redirect.
        // If it's safe mode, we shouldn't redirect immediately to prevent loop or SEO drop,
        // BUT Next.js needs a valid route. If `/` doesn't map to a page, we must redirect.
        // Let's assume `/` expects a country slug. We will do a safe 307 redirect.
        // Wait, the prompt says: "If user enters root domain / AND no cookie exists AND not a bot -> Redirect to /country"

        if (!isBot && !hasMarketingParam && !isFromSearchEngine && !cookieCountry) {
            const redirectUrl = new URL(`/${detectedCountry}`, request.url);
            const redirectResponse = NextResponse.redirect(redirectUrl, 307);

            // Set cookie for 30 days
            redirectResponse.cookies.set('country_preference', detectedCountry, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                sameSite: 'lax',
            });
            return redirectResponse;
        } else if (cookieCountry && !hasCountryInUrl) {
            // If they have a cookie and hit root, redirect them to their preference
            const redirectUrl = new URL(`/${cookieCountry}`, request.url);
            return NextResponse.redirect(redirectUrl, 307);
        } else if (!hasCountryInUrl) {
            // Fallback for bots/safe mode hitting root: send them to fallback country
            // to ensure they hit a valid localized page (required for app/[country] structure).
            const redirectUrl = new URL(`/${detectedCountry}`, request.url);
            const redirectResponse = NextResponse.redirect(redirectUrl, 307);
            // Do NOT set cookie for bots.
            return redirectResponse;
        }
    }

    // 6. PHASE 6: A/B TESTING (Blog Placements)
    const isBlogPost = pathname.match(/\/[a-z]{2}\/blog\/.+/);
    if (isBlogPost) {
        const existingVariant = request.cookies.get('ab_placement')?.value;
        if (!existingVariant) {
            const bucket = Math.random() < 0.5 ? 'A' : 'B';
            response.cookies.set('ab_placement', bucket, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
                path: '/'
            });
            response.headers.set('x-ab-placement', bucket);
        } else {
            response.headers.set('x-ab-placement', existingVariant);
        }
    }

    // Append original request headers for downstream layout.tsx access
    return response;
}
