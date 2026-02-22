'use strict';

const SITE_URL = process.env.SITE_URL || 'https://rukncoupons.com';

/**
 * Build meta tag object for a page
 */
function buildMeta({
    title,
    description,
    canonical,
    robots = 'index, follow',
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    seoConfig = null,
    defaultImage = '',
}) {
    const finalTitle = seoConfig?.metaTitle || title;
    const finalDesc = seoConfig?.metaDescription || description;
    const finalOgTitle = seoConfig?.ogTitle || ogTitle || finalTitle;
    const finalOgDesc = seoConfig?.ogDescription || ogDescription || finalDesc;
    const finalImage = seoConfig?.ogImage || ogImage || defaultImage;
    const finalCanonical = seoConfig?.canonicalUrl || canonical || SITE_URL;
    const finalRobots = seoConfig?.noIndex ? 'noindex, nofollow' : robots;

    return {
        title: finalTitle,
        description: finalDesc,
        canonical: finalCanonical,
        robots: finalRobots,
        ogTitle: finalOgTitle,
        ogDescription: finalOgDesc,
        ogImage: finalImage,
        ogType,
        twitterCard: 'summary_large_image',
        twitterTitle: finalOgTitle,
        twitterDescription: finalOgDesc,
        twitterImage: finalImage,
    };
}

/**
 * Build hreflang link objects for multi-country pages
 * Returns array of { hreflang, href } objects
 */
function buildHreflangTags(countries, currentPath, siteUrl = SITE_URL) {
    if (!countries || countries.length === 0) return [];

    // Extract path segments
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length === 0) return [];

    const currentCountryCode = parts[0];
    const isCountryRoute = countries.some(c => c.code === currentCountryCode);
    if (!isCountryRoute) return [];

    const suffix = parts.slice(1).join('/');

    const tags = countries.map(country => ({
        hreflang: `ar-${country.code}`,
        href: `${siteUrl}/${country.code}${suffix ? '/' + suffix : ''}`,
    }));

    // x-default points to SA (primary market)
    tags.push({
        hreflang: 'x-default',
        href: `${siteUrl}/sa${suffix ? '/' + suffix : ''}`,
    });

    return tags;
}

module.exports = { buildMeta, buildHreflangTags, SITE_URL };
