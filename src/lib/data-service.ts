/**
 * data-service.ts — Server-Only Data Layer
 *
 * ALL Firestore access goes through Firebase Admin SDK.
 * No client-side Firebase SDK is used anywhere in this project.
 *
 * Performance strategy:
 *   1. unstable_cache()  → cross-request cache with revalidation tags
 *   2. React.cache()     → per-request deduplication (generateMetadata + page share results)
 *
 * Cache invalidation:
 *   Admin actions call revalidateTag() to bust specific caches on-demand.
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { adminDb } from "./firebase-admin";
import { applyRules } from "./rule-engine";
import {
    Country,
    Category,
    Store,
    Coupon,
    Rule,
    Slide,
    AdBanner,
    BlogPost,
    TrackingConfig,
    SocialConfig,
    AffiliateProduct
} from "./types";

// ─── Cache TTL Constants ────────────────────────────────────────────────────
const CACHE_TTL = 3600;       // 1 hour — matches ISR revalidate interval
const SETTINGS_TTL = 7200;    // 2 hours — settings change rarely

// ─── Low-Level Cached Fetchers ──────────────────────────────────────────────
// Each function is wrapped in unstable_cache for cross-request persistence.
// Tags allow surgical cache invalidation from admin-actions.ts.

export const getCountries = unstable_cache(
    async (): Promise<Country[]> => {
        const snapshot = await adminDb.collection("countries").get();
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));

        // Deduplicate countries by code to prevent UI bugs if Firestore has duplicates
        const uniqueCountries = [];
        const seenCodes = new Set();
        for (const country of docs) {
            if (country.code && !seenCodes.has(country.code)) {
                seenCodes.add(country.code);
                uniqueCountries.push(country);
            }
        }
        return uniqueCountries;
    },
    ["countries"],
    { revalidate: CACHE_TTL, tags: ["countries"] }
);

export const getCategories = unstable_cache(
    async (): Promise<Category[]> => {
        const snapshot = await adminDb.collection("categories").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    },
    ["categories"],
    { revalidate: CACHE_TTL, tags: ["categories"] }
);

export const getStores = unstable_cache(
    async (): Promise<Store[]> => {
        const snapshot = await adminDb.collection("stores").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
    },
    ["stores"],
    { revalidate: CACHE_TTL, tags: ["stores"] }
);

export const getCoupons = unstable_cache(
    async (): Promise<Coupon[]> => {
        const snapshot = await adminDb.collection("coupons").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
    },
    ["coupons"],
    { revalidate: CACHE_TTL, tags: ["coupons"] }
);

export const getRules = unstable_cache(
    async (): Promise<Rule[]> => {
        const snapshot = await adminDb.collection("rules").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rule));
    },
    ["rules"],
    { revalidate: CACHE_TTL, tags: ["rules"] }
);

export const getSlides = unstable_cache(
    async (): Promise<Slide[]> => {
        const snapshot = await adminDb.collection("slides").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slide));
    },
    ["slides"],
    { revalidate: CACHE_TTL, tags: ["slides"] }
);

export const getAffiliateProducts = unstable_cache(
    async (): Promise<AffiliateProduct[]> => {
        const snapshot = await adminDb.collection("affiliateProducts").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AffiliateProduct));
    },
    ["affiliateProducts"],
    { revalidate: CACHE_TTL, tags: ["affiliateProducts"] }
);

export const getAdBanners = unstable_cache(
    async (): Promise<AdBanner[]> => {
        const snapshot = await adminDb.collection("adBanners").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdBanner));
    },
    ["adBanners"],
    { revalidate: CACHE_TTL, tags: ["adBanners"] }
);

export const getBlogPosts = unstable_cache(
    async (): Promise<BlogPost[]> => {
        const snapshot = await adminDb.collection("blogPosts").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    },
    ["blogPosts"],
    { revalidate: CACHE_TTL, tags: ["blogPosts"] }
);

// ─── Aggregated Data (Request-Deduplicated) ─────────────────────────────────
// React.cache() ensures generateMetadata() and the page component
// share the same result within a single render — eliminates the double-read bug.

export const getCountryData = cache(async (countryCode: string) => {
    const [
        countries,
        categories,
        stores,
        allCoupons,
        rules,
        slides,
        adBanners,
        blogPosts
    ] = await Promise.all([
        getCountries(),
        getCategories(),
        getStores(),
        getCoupons(),
        getRules(),
        getSlides(),
        getAdBanners(),
        getBlogPosts()
    ]);

    const currentCountry = countries.find(c => c.code === countryCode);
    const countryStores = stores.filter(s => s.countryCodes.includes(countryCode) && s.isActive !== false);

    // Apply Rule Engine
    const countryCoupons = applyRules(
        allCoupons.filter(c => c.countryCodes.includes(countryCode) && c.isActive !== false),
        rules,
        countryCode,
        stores
    );

    const countrySlides = slides.filter(s => {
        const codes = s.countryCodes || (s.countryCode ? [s.countryCode] : []);
        return codes.length === 0 || codes.includes(countryCode);
    });

    const countryBlogPosts = blogPosts.filter(p => {
        const postCountries = Array.isArray(p.countryCodes) ? p.countryCodes : [];
        return p.status === 'published' && (postCountries.length === 0 || postCountries.includes(countryCode));
    });

    return {
        currentCountry,
        countries,
        categories,
        stores: countryStores,
        coupons: countryCoupons,
        slides: countrySlides,
        blogPosts: countryBlogPosts,
        adBanners: adBanners.filter(b => !b.countryCodes || b.countryCodes.includes(countryCode))
    };
});

export const getStoreBySlug = cache(async (countryCode: string, slug: string) => {
    const stores = await getStores();
    const store = stores.find(s => s.slug === slug && s.isActive !== false);
    if (!store || !store.countryCodes.includes(countryCode)) return null;

    const coupons = await getCoupons();
    const rules = await getRules();

    const storeCoupons = applyRules(
        coupons.filter(c => c.storeId === store.id && c.countryCodes.includes(countryCode) && c.isActive !== false),
        rules,
        countryCode,
        stores
    );

    return { store, coupons: storeCoupons };
});

export const getCouponsForStore = cache(async (storeId: string, countryCode: string) => {
    const coupons = await getCoupons();
    const rules = await getRules();
    const stores = await getStores();

    return applyRules(
        coupons.filter(c => c.storeId === storeId && c.countryCodes.includes(countryCode) && c.isActive !== false),
        rules,
        countryCode,
        stores
    );
});

export const getPostBySlug = cache(async (countryCode: string, slug: string) => {
    const posts = await getBlogPosts();
    const post = posts.find(p => p.slug === slug && p.status === 'published');
    if (!post) return null;
    const codes = Array.isArray(post.countryCodes) ? post.countryCodes : [];
    if (codes.length > 0 && !codes.includes(countryCode)) return null;
    return post;
});

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
    try {
        const adminSnapshot = await adminDb.collection("admins")
            .where("username", "==", username)
            .where("password", "==", password)
            .limit(1)
            .get();

        return !adminSnapshot.empty;
    } catch (error) {
        console.error("Error verifying credentials:", error);
        return false;
    }
}

export const getTrackingConfig = unstable_cache(
    async (): Promise<TrackingConfig> => {
        const doc = await adminDb.collection("settings").doc("tracking").get();
        const data = doc.data() as TrackingConfig;
        return {
            ga4MeasurementId: data?.ga4MeasurementId ?? "",
            googleAdsConversionId: data?.googleAdsConversionId ?? "",
            metaPixelId: data?.metaPixelId ?? "",
            tiktokPixelId: data?.tiktokPixelId ?? "",
            enableGA4: data?.enableGA4 ?? false,
            enableGoogleAds: data?.enableGoogleAds ?? false,
            enableMeta: data?.enableMeta ?? false,
            enableTikTok: data?.enableTikTok ?? false,
            customHeadCode: data?.customHeadCode ?? ""
        };
    },
    ["tracking-config"],
    { revalidate: SETTINGS_TTL, tags: ["tracking"] }
);

export const getSocialConfig = unstable_cache(
    async (): Promise<SocialConfig> => {
        const doc = await adminDb.collection("settings").doc("social").get();
        const data = doc.data() as SocialConfig;
        return {
            facebook: data?.facebook ?? "",
            twitter: data?.twitter ?? "",
            instagram: data?.instagram ?? "",
            youtube: data?.youtube ?? "",
            tiktok: data?.tiktok ?? "",
            snapchat: data?.snapchat ?? "",
            upscrolled: data?.upscrolled ?? ""
        };
    },
    ["social-config"],
    { revalidate: SETTINGS_TTL, tags: ["social"] }
);
