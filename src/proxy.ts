import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // Auth logic for admin panel
    const token = request.cookies.get("admin_token");
    const isLoginPage = pathname === "/login";
    const isAdminPage = pathname.startsWith("/admin");

    if (isAdminPage && (!token || token.value !== "valid_session")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isLoginPage && token?.value === "valid_session") {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Fast root redirection logic based on user location or cookie
    if (pathname === "/") {
        const savedCountry = request.cookies.get("user_country")?.value;
        const query = searchParams.toString();
        const suffix = query ? `?${query}` : "";

        if (savedCountry) {
            return NextResponse.redirect(new URL(`/${savedCountry}${suffix}`, request.url));
        }

        const countryHeader = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry");
        let targetCountry = "sa"; // Default fallback

        if (countryHeader) {
            const countryCode = countryHeader.toLowerCase();
            const supported = ['sa', 'ae', 'kw', 'eg', 'bh', 'qa', 'om', 'jo'];
            if (supported.includes(countryCode)) {
                targetCountry = countryCode;
            }
        }

        const response = NextResponse.redirect(new URL(`/${targetCountry}${suffix}`, request.url));
        response.cookies.set("user_country", targetCountry, { maxAge: 60 * 60 * 24 * 365, path: '/' });
        return response;
    }

    // Phase 6: A/B Testing — assign blog post readers to placement bucket
    const isBlogPost = pathname.match(/\/[a-z]{2}\/blog\/.+/);
    if (isBlogPost) {
        const res = NextResponse.next();
        const existingVariant = request.cookies.get('ab_placement')?.value;
        if (!existingVariant) {
            const bucket = Math.random() < 0.5 ? 'A' : 'B';
            res.cookies.set('ab_placement', bucket, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
                path: '/'
            });
            res.headers.set('x-ab-placement', bucket);
        } else {
            res.headers.set('x-ab-placement', existingVariant);
        }
        return res;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/admin/:path*", "/login"],
};
