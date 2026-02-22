'use strict';

const dataService = require('../services/data.service');
const { buildMeta, buildHreflangTags, SITE_URL } = require('../services/seo.service');
const { generateWebsiteSchema, buildJsonLd } = require('../services/schema.service');

const VALID_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];

async function getHome(req, res, next) {
    try {
        const countryCode = req.params.country;
        if (!VALID_COUNTRIES.includes(countryCode)) {
            return res.redirect(301, `/${process.env.DEFAULT_COUNTRY || 'sa'}`);
        }

        const [countries, country, stores, coupons, slides, categories, adBanners, blogPosts, trackingConfig, socialConfig] = await Promise.all([
            dataService.getCountries(),
            dataService.getCountries().then(cs => cs.find(c => c.code === countryCode)),
            dataService.getStoresForCountry(countryCode),
            dataService.getCouponsForCountry(countryCode),
            dataService.getSlidesForCountry(countryCode),
            dataService.getCategories(),
            dataService.getAdBannersForCountry(countryCode),
            dataService.getBlogPostsForCountry(countryCode),
            dataService.getTrackingConfig(),
            dataService.getSocialConfig(),
        ]);

        const countryName = country?.name || 'السعودية';
        const meta = buildMeta({
            title: `كوبونات خصم ${countryName} - أحدث أكواد الخصم والعروض 2026`,
            description: `أفضل موقع للحصول على كود خصم نون، أمازون، شي إن، نمشي، والمزيد في ${countryName}. كوبونات حصرية ومحدثة يومياً لتوفير المال.`,
            canonical: `${SITE_URL}/${countryCode}`,
            ogImage: `${SITE_URL}/images/og-default.jpg`,
            seoConfig: country?.seo || null,
        });

        const hreflangTags = buildHreflangTags(countries, `/${countryCode}`);
        const jsonLd = buildJsonLd([generateWebsiteSchema()]);

        // Sort coupons: exclusive first
        const sortedCoupons = [...coupons].sort((a, b) =>
            Number(b._ruleOverrides?.featured || b.isExclusive) - Number(a._ruleOverrides?.featured || a.isExclusive)
        );

        // Enrich coupons with store data
        const allStores = await dataService.getStores();
        const storeMap = Object.fromEntries(allStores.map(s => [s.id, s]));

        res.render('pages/home', {
            title: meta.title,
            meta,
            jsonLd,
            hreflangTags,
            trackingConfig,
            socialConfig,
            countryCode,
            countries,
            country,
            stores: stores.slice(0, 10), // Featured stores
            allStores: stores,
            coupons: sortedCoupons,
            slides,
            categories: categories.filter(c => c.type === 'store' || !c.type),
            adBanners,
            recentPosts: blogPosts.slice(0, 3),
            storeMap,
            SITE_URL,
        });
    } catch (err) {
        console.error('[HomeController]', err);
        next(err);
    }
}

module.exports = { getHome };
