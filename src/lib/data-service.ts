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
    SocialConfig
} from "./types";

export async function getCountries(): Promise<Country[]> {
    const snapshot = await adminDb.collection("countries").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Country));
}

export async function getCategories(): Promise<Category[]> {
    const snapshot = await adminDb.collection("categories").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function getStores(): Promise<Store[]> {
    const snapshot = await adminDb.collection("stores").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
}

export async function getCoupons(): Promise<Coupon[]> {
    const snapshot = await adminDb.collection("coupons").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
}

export async function getRules(): Promise<Rule[]> {
    const snapshot = await adminDb.collection("rules").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rule));
}

export async function getSlides(): Promise<Slide[]> {
    const snapshot = await adminDb.collection("slides").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slide));
}

export async function getAdBanners(): Promise<AdBanner[]> {
    const snapshot = await adminDb.collection("adBanners").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdBanner));
}

export async function getBlogPosts(): Promise<BlogPost[]> {
    const snapshot = await adminDb.collection("blogPosts").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
}


// Aggregated data for a specific country context
export async function getCountryData(countryCode: string) {
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
}

export async function getStoreBySlug(countryCode: string, slug: string) {
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
}

export async function getCouponsForStore(storeId: string, countryCode: string) {
    const coupons = await getCoupons();
    const rules = await getRules();
    const stores = await getStores();

    return applyRules(
        coupons.filter(c => c.storeId === storeId && c.countryCodes.includes(countryCode) && c.isActive !== false),
        rules,
        countryCode,
        stores
    );
}

export async function getPostBySlug(countryCode: string, slug: string) {
    const posts = await getBlogPosts();
    const post = posts.find(p => p.slug === slug && p.status === 'published');
    if (!post) return null;
    const codes = Array.isArray(post.countryCodes) ? post.countryCodes : [];
    if (codes.length > 0 && !codes.includes(countryCode)) return null;
    return post;
}

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

export async function getTrackingConfig(): Promise<TrackingConfig> {
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
        enableTikTok: data?.enableTikTok ?? false
    };
}

export async function getSocialConfig(): Promise<SocialConfig> {
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
}
