import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    runtime: 'experimental-edge',
    unstable_allowDynamic: [
        '/node_modules/function-bind/**',
    ],
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)).*)',
    ],
};

const SUPPORTED_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];
const SUPPORTED_LOCALES = ['ar', 'en'];
const DEFAULT_LOCALE = 'ar';
const FALLBACK_COUNTRY = 'sa';

const BOT_USER_AGENTS = [
    'Googlebot', 'Bingbot', 'AhrefsBot', 'SemrushBot', 'DotBot',
    'YandexBot', 'Baiduspider', 'DuckDuckBot', 'Slurp'
];

const BYPASS_PATHS = [
    '/robots.txt',
    '/sitemap.xml',
    '/api',
    '/_next',
    '/manifest.json',
];

const MARKETING_PARAMS = ['utm_', 'gclid', 'fbclid'];
const SEARCH_REFERRERS = ['google.com', 'bing.com'];

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const pathname = url.pathname;

    // 1. PATH EXCLUSIONS
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

    if (isAdminPage || isLoginPage) {
        return NextResponse.next();
    }

    // 2. DETECT COUNTRY
    const cookieCountry = request.cookies.get('country_preference')?.value;
    const cfCountry = request.headers.get('CF-IPCountry');
    const vercelCountryHeaders = request.headers.get('x-vercel-ip-country');
    // @ts-ignore
    const vercelGeoCountry = request.geo?.country;

    let detectedCountry = (
        cookieCountry || cfCountry || vercelCountryHeaders || vercelGeoCountry || FALLBACK_COUNTRY
    ).toLowerCase();

    if (!SUPPORTED_COUNTRIES.includes(detectedCountry)) {
        detectedCountry = FALLBACK_COUNTRY;
    }

    // Clone headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-detected-country', detectedCountry);

    // 3. PARSE URL SEGMENTS
    const pathParts = pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0]?.toLowerCase() || '';
    const secondSegment = pathParts[1]?.toLowerCase() || '';

    // 4. 301 REDIRECT — Old URLs without locale prefix (e.g., /sa/noon → /ar/sa/noon)
    if (SUPPORTED_COUNTRIES.includes(firstSegment) && !SUPPORTED_LOCALES.includes(firstSegment)) {
        // Old URL pattern: /{country}/... → redirect to /ar/{country}/...
        const rest = pathParts.slice(0).join('/');
        const redirectUrl = new URL(`/${DEFAULT_LOCALE}/${rest}${url.search}`, request.url);
        return NextResponse.redirect(redirectUrl, 301);
    }

    // 5. CHECK IF URL HAS VALID LOCALE
    const hasValidLocale = SUPPORTED_LOCALES.includes(firstSegment);
    const currentLocale = hasValidLocale ? firstSegment : DEFAULT_LOCALE;
    const hasCountryInUrl = hasValidLocale
        ? SUPPORTED_COUNTRIES.includes(secondSegment)
        : SUPPORTED_COUNTRIES.includes(firstSegment);

    // Inject locale header
    requestHeaders.set('x-locale', currentLocale);

    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });

    // 6. BOT & SEO SAFE MODE
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
    const isSafeModeActive = isBot || hasMarketingParam || isFromSearchEngine;

    // 7. REDIRECT LOGIC FOR ROOT DOMAIN OR LOCALE ONLY DOMAIN (/, /ar, /en)
    const isRootOrLocaleOnly = pathname === '/' || SUPPORTED_LOCALES.includes(pathname.substring(1));
    if (isRootOrLocaleOnly) {
        const localeParams = pathname === '/' ? DEFAULT_LOCALE : pathname.substring(1);
        let targetCountry = cookieCountry || detectedCountry || FALLBACK_COUNTRY;
        if (!SUPPORTED_COUNTRIES.includes(targetCountry)) {
            targetCountry = FALLBACK_COUNTRY;
        }

        const redirectType = isBot || isFromSearchEngine ? 301 : 307;
        const redirectUrl = new URL(`/${localeParams}/${targetCountry}`, request.url);
        const redirectResponse = NextResponse.redirect(redirectUrl, redirectType);

        if (!isBot && !cookieCountry && targetCountry === detectedCountry) {
            redirectResponse.cookies.set('country_preference', targetCountry, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30,
                sameSite: 'lax',
            });
        }
        return redirectResponse;
    }

    // 8. A/B TESTING (Blog Placements)
    const isBlogPost = pathname.match(/\/[a-z]{2}\/[a-z]{2}\/blog\/.+/);
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

    return response;
}
