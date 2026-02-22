import { MetadataRoute } from "next";
import { getCountries, getStores, getBlogPosts } from "@/lib/data-service";
import { SITE_URL, SUPPORTED_COUNTRIES } from "@/lib/seo-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [countries, stores, blogPosts] = await Promise.all([
        getCountries(),
        getStores(),
        getBlogPosts(),
    ]);

    const validCountryCodes = countries.map(c => c.code);
    const entries: MetadataRoute.Sitemap = [];
    const now = new Date();

    for (const countryCode of SUPPORTED_COUNTRIES) {
        if (!validCountryCodes.includes(countryCode)) continue;

        // 1. Country homepage
        entries.push({
            url: `${SITE_URL}/${countryCode}`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1.0,
        });

        // 2. Static pages
        for (const page of ["stores", "coupons", "blog"]) {
            entries.push({
                url: `${SITE_URL}/${countryCode}/${page}`,
                lastModified: now,
                changeFrequency: "daily",
                priority: 0.8,
            });
        }

        // 3. Store pages (only active stores for this country)
        const countryStores = stores.filter(
            s => s.countryCodes?.includes(countryCode) && s.isActive !== false
        );
        for (const store of countryStores) {
            entries.push({
                url: `${SITE_URL}/${countryCode}/${store.slug}`,
                lastModified: now,
                changeFrequency: "daily",
                priority: 0.9,
            });
        }

        // 4. Blog posts
        const publishedPosts = blogPosts.filter(p => {
            const codes = Array.isArray(p.countryCodes) ? p.countryCodes : [];
            return (
                p.status === "published" &&
                (codes.length === 0 || codes.includes(countryCode))
            );
        });
        for (const post of publishedPosts) {
            entries.push({
                url: `${SITE_URL}/${countryCode}/blog/${encodeURIComponent(post.slug)}`,
                lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
                changeFrequency: "weekly",
                priority: 0.6,
            });
        }
    }

    return entries;
}
