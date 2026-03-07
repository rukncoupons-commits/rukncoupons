import { MetadataRoute } from "next";
import { getCountries, getStores, getBlogPosts } from "@/lib/data-service";
import { SITE_URL, SUPPORTED_COUNTRIES } from "@/lib/seo-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Regenerate sitemap every hour

const LOCALES = ["ar", "en"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [countries, stores, blogPosts] = await Promise.all([
        getCountries(),
        getStores(),
        getBlogPosts(),
    ]);

    const validCountryCodes = countries.map(c => c.code);
    const entries: MetadataRoute.Sitemap = [];
    const now = new Date();

    for (const locale of LOCALES) {
        for (const countryCode of SUPPORTED_COUNTRIES) {
            if (!validCountryCodes.includes(countryCode)) continue;

            // 1. Country homepage
            entries.push({
                url: `${SITE_URL}/${locale}/${countryCode}`,
                lastModified: now,
                changeFrequency: "daily",
                priority: locale === "ar" ? 1.0 : 0.9,
                alternates: {
                    languages: {
                        ar: `${SITE_URL}/ar/${countryCode}`,
                        en: `${SITE_URL}/en/${countryCode}`,
                    },
                },
            });

            // 2. Static pages
            for (const page of ["stores", "coupons", "blog", "about", "contact", "privacy"]) {
                entries.push({
                    url: `${SITE_URL}/${locale}/${countryCode}/${page}`,
                    lastModified: now,
                    changeFrequency: page === "privacy" ? "monthly" : "daily",
                    priority: ["about", "contact", "privacy"].includes(page) ? 0.3 : 0.7,
                    alternates: {
                        languages: {
                            ar: `${SITE_URL}/ar/${countryCode}/${page}`,
                            en: `${SITE_URL}/en/${countryCode}/${page}`,
                        },
                    },
                });
            }

            // 3. Store pages (only active stores for this country)
            const countryStores = stores.filter(
                s => s.countryCodes?.includes(countryCode) && s.isActive !== false
            );
            for (const store of countryStores) {
                entries.push({
                    url: `${SITE_URL}/${locale}/${countryCode}/${store.slug}`,
                    lastModified: now,
                    changeFrequency: "daily",
                    priority: locale === "ar" ? 0.9 : 0.85,
                    alternates: {
                        languages: {
                            ar: `${SITE_URL}/ar/${countryCode}/${store.slug}`,
                            en: `${SITE_URL}/en/${countryCode}/${store.slug}`,
                        },
                    },
                });
            }

            // 4. Blog posts (only for Arabic — blog content is Arabic)
            if (locale === "ar") {
                const publishedPosts = blogPosts.filter(p => {
                    const codes = Array.isArray(p.countryCodes) ? p.countryCodes : [];
                    return (
                        p.status === "published" &&
                        (codes.length === 0 || codes.includes(countryCode))
                    );
                });
                for (const post of publishedPosts) {
                    entries.push({
                        url: `${SITE_URL}/ar/${countryCode}/blog/${encodeURIComponent(post.slug)}`,
                        lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
                        changeFrequency: "weekly",
                        priority: 0.6,
                    });
                }
            }
        }
    }

    return entries;
}
