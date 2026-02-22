'use strict';

const { SITE_URL } = require('./seo.service');

function generateStoreSchema(store, country) {
    const countryCode = country?.code || 'sa';
    const storeUrl = `${SITE_URL}/${countryCode}/${store.slug}`;
    const storeId = `${storeUrl}#store`;

    return {
        '@type': 'Store',
        '@id': storeId,
        mainEntityOfPage: { '@type': 'WebPage', '@id': storeUrl },
        name: store.name,
        description: store.description,
        url: storeUrl,
        inLanguage: 'ar',
        logo: { '@type': 'ImageObject', url: store.logoUrl },
        image: { '@type': 'ImageObject', url: store.logoUrl },
        areaServed: {
            '@type': 'Country',
            name: country?.name || 'Global',
            identifier: countryCode.toUpperCase(),
        },
    };
}

function generateOfferSchema(coupon, store, country) {
    const countryCode = country?.code || 'sa';
    const storeUrl = `${SITE_URL}/${countryCode}/${store.slug}`;
    const storeId = `${storeUrl}#store`;
    const couponUrl = `${storeUrl}?coupon=${coupon.id}`;

    const schema = {
        '@type': 'Offer',
        name: coupon.title,
        description: coupon.description,
        url: couponUrl,
        inLanguage: 'ar',
        availability: 'https://schema.org/InStock',
        seller: { '@id': storeId },
        areaServed: {
            '@type': 'Country',
            name: country?.name || 'Global',
            identifier: countryCode.toUpperCase(),
        },
    };

    if (coupon.code) schema.couponCode = coupon.code;
    if (coupon.expiryDate) schema.validThrough = coupon.expiryDate;

    return schema;
}

function generateBlogPostingSchema(post, countryCode) {
    const url = `${SITE_URL}/${countryCode}/blog/${post.slug}`;

    return {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        author: { '@type': 'Person', name: post.author },
        publisher: {
            '@type': 'Organization',
            name: 'ركن الكوبونات',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/images/logo.png`,
            },
        },
        datePublished: post.date,
        dateModified: post.updatedAt || post.date,
        inLanguage: 'ar',
    };
}

function generateFAQSchema(faqs) {
    return {
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
    };
}

function generateBreadcrumbSchema(items) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

function generateWebsiteSchema() {
    return {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'ركن الكوبونات',
        inLanguage: 'ar',
        publisher: {
            '@type': 'Organization',
            name: 'ركن الكوبونات',
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/images/logo.png`,
            },
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/sa/coupons?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

function buildJsonLd(schemas) {
    const graphItems = Array.isArray(schemas) ? schemas : [schemas];
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': graphItems,
    });
}

module.exports = {
    generateStoreSchema,
    generateOfferSchema,
    generateBlogPostingSchema,
    generateFAQSchema,
    generateBreadcrumbSchema,
    generateWebsiteSchema,
    buildJsonLd,
};
