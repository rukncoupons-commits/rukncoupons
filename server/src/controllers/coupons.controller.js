'use strict';

const dataService = require('../services/data.service');
const { buildMeta, buildHreflangTags, SITE_URL } = require('../services/seo.service');

const VALID_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];

async function getCoupons(req, res, next) {
    try {
        const countryCode = req.params.country;
        if (!VALID_COUNTRIES.includes(countryCode)) return res.redirect(301, '/sa/coupons');

        const selectedStore = req.query.store || '';
        const selectedCategory = req.query.category || '';
        const searchQuery = req.query.q || '';

        const [countries, country, allCoupons, stores, categories, adBanners, blogPosts, trackingConfig, socialConfig] = await Promise.all([
            dataService.getCountries(),
            dataService.getCountries().then(cs => cs.find(c => c.code === countryCode)),
            dataService.getCouponsForCountry(countryCode),
            dataService.getStoresForCountry(countryCode),
            dataService.getCategories(),
            dataService.getAdBannersForCountry(countryCode),
            dataService.getBlogPostsForCountry(countryCode),
            dataService.getTrackingConfig(),
            dataService.getSocialConfig(),
        ]);

        const countryName = country?.name || '';

        // Filter coupons
        let coupons = allCoupons;
        if (selectedStore) coupons = coupons.filter(c => c.storeId === selectedStore);
        if (selectedCategory) coupons = coupons.filter(c => c.categories && c.categories.includes(selectedCategory));

        const meta = buildMeta({
            title: `جميع كوبونات وعروض ${countryName} | ركن الكوبونات`,
            description: `تصفح أحدث الكوبونات والخصومات لجميع المتاجر في ${countryName}. عروض حصرية ومتجددة يومياً.`,
            canonical: `${SITE_URL}/${countryCode}/coupons`,
        });

        const hreflangTags = buildHreflangTags(countries, `/${countryCode}/coupons`);

        // Build store map for coupon cards
        const allStores = await dataService.getStores();
        const storeMap = Object.fromEntries(allStores.map(s => [s.id, s]));

        res.render('pages/coupons', {
            title: meta.title,
            meta,
            jsonLd: null,
            hreflangTags,
            trackingConfig,
            socialConfig,
            countryCode,
            countries,
            country,
            coupons,
            stores,
            categories: categories.filter(c => c.type === 'store' || !c.type),
            adBanners,
            recentPosts: blogPosts.slice(0, 3),
            storeMap,
            selectedStore,
            selectedCategory,
            searchQuery,
            SITE_URL,
        });
    } catch (err) {
        console.error('[CouponsController]', err);
        next(err);
    }
}

module.exports = { getCoupons };
