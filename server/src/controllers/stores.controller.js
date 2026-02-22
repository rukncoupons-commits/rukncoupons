'use strict';

const dataService = require('../services/data.service');
const { buildMeta, buildHreflangTags, SITE_URL } = require('../services/seo.service');

const VALID_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];

async function getStores(req, res, next) {
    try {
        const countryCode = req.params.country;
        if (!VALID_COUNTRIES.includes(countryCode)) return res.redirect(301, '/sa/stores');

        const searchQuery = req.query.q || '';
        const selectedCategory = req.query.category || '';

        const [countries, country, stores, coupons, categories, adBanners, blogPosts, trackingConfig, socialConfig] = await Promise.all([
            dataService.getCountries(),
            dataService.getCountries().then(cs => cs.find(c => c.code === countryCode)),
            dataService.getStoresForCountry(countryCode),
            dataService.getCouponsForCountry(countryCode),
            dataService.getCategories(),
            dataService.getAdBannersForCountry(countryCode),
            dataService.getBlogPostsForCountry(countryCode),
            dataService.getTrackingConfig(),
            dataService.getSocialConfig(),
        ]);

        const countryName = country?.name || '';

        // Build coupon count map
        const couponCountMap = {};
        coupons.forEach(c => {
            couponCountMap[c.storeId] = (couponCountMap[c.storeId] || 0) + 1;
        });

        // Filter stores
        let filteredStores = stores;
        if (searchQuery) {
            filteredStores = filteredStores.filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedCategory) {
            filteredStores = filteredStores.filter(s => s.category === selectedCategory);
        }

        const meta = buildMeta({
            title: `جميع المتاجر في ${countryName} | ركن الكوبونات`,
            description: `قائمة كاملة بجميع المتاجر والعلامات التجارية المتوفرة في ${countryName}. احصل على أكواد خصم حصرية.`,
            canonical: `${SITE_URL}/${countryCode}/stores`,
        });

        const hreflangTags = buildHreflangTags(countries, `/${countryCode}/stores`);

        res.render('pages/stores', {
            title: meta.title,
            meta,
            jsonLd: null,
            hreflangTags,
            trackingConfig,
            socialConfig,
            countryCode,
            countries,
            country,
            stores: filteredStores,
            allStores: stores,
            couponCountMap,
            categories: categories.filter(c => c.type === 'store' || !c.type),
            adBanners,
            recentPosts: blogPosts.slice(0, 3),
            searchQuery,
            selectedCategory,
            SITE_URL,
        });
    } catch (err) {
        console.error('[StoresController]', err);
        next(err);
    }
}

module.exports = { getStores };
