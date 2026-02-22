'use strict';

const dataService = require('../services/data.service');
const { buildMeta, buildHreflangTags, SITE_URL } = require('../services/seo.service');
const { generateStoreSchema, generateOfferSchema, buildJsonLd } = require('../services/schema.service');

const VALID_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];

async function getStore(req, res, next) {
    try {
        const countryCode = req.params.country;
        const storeSlug = req.params.storeSlug;

        if (!VALID_COUNTRIES.includes(countryCode)) return res.redirect(301, `/sa/${storeSlug}`);

        const [countries, country, store, allCoupons, categories, adBanners, blogPosts, trackingConfig, socialConfig] = await Promise.all([
            dataService.getCountries(),
            dataService.getCountries().then(cs => cs.find(c => c.code === countryCode)),
            dataService.getStoreBySlug(storeSlug),
            dataService.getCouponsForCountry(countryCode),
            dataService.getCategories(),
            dataService.getAdBannersForCountry(countryCode),
            dataService.getBlogPostsForCountry(countryCode),
            dataService.getTrackingConfig(),
            dataService.getSocialConfig(),
        ]);

        if (!store) {
            return res.status(404).render('pages/404', {
                title: 'المتجر غير موجود | ركن الكوبونات',
                meta: {
                    title: 'المتجر غير موجود',
                    description: 'المتجر الذي تبحث عنه غير موجود.',
                    canonical: `${SITE_URL}/${countryCode}/stores`,
                    robots: 'noindex, nofollow',
                    ogTitle: 'المتجر غير موجود',
                    ogDescription: '',
                    ogImage: '',
                    twitterCard: 'summary',
                },
                jsonLd: null,
                hreflangTags: [],
                trackingConfig,
                socialConfig,
                countryCode,
                countries,
            });
        }

        // Filter coupons for this store
        const storeCoupons = allCoupons.filter(c => c.storeId === store.id);

        // Get country-specific SEO config
        let seoConfig = store.seo || null;
        if (store.countrySeo && store.countrySeo[countryCode]) {
            seoConfig = store.countrySeo[countryCode];
        }

        // Get country-specific long description
        let longDescription = store.longDescription || '';
        if (store.longDescriptions && store.longDescriptions[countryCode]) {
            longDescription = store.longDescriptions[countryCode];
        }

        const countryName = country?.name || '';
        const meta = buildMeta({
            title: `كود خصم ${store.name} ${countryName} فعال 2026 | ركن الكوبونات`,
            description: `أحدث كوبونات وعروض ${store.name} في ${countryName}. ${store.description}`,
            canonical: `${SITE_URL}/${countryCode}/${store.slug}`,
            ogImage: store.logoUrl,
            seoConfig,
        });

        const hreflangTags = buildHreflangTags(countries, `/${countryCode}/${store.slug}`);

        // Build schema
        const storeSchema = generateStoreSchema(store, country);
        const offerSchemas = storeCoupons
            .filter(c => !c._ruleOverrides?.suppressSchema)
            .slice(0, 3)
            .map(c => generateOfferSchema(c, store, country));
        const jsonLd = buildJsonLd([storeSchema, ...offerSchemas]);

        // Enrich coupons with store data
        const allStores = await dataService.getStores();
        const storeMap = Object.fromEntries(allStores.map(s => [s.id, s]));

        res.render('pages/store', {
            title: meta.title,
            meta,
            jsonLd,
            hreflangTags,
            trackingConfig,
            socialConfig,
            countryCode,
            countries,
            country,
            store,
            storeCoupons,
            longDescription,
            categories,
            adBanners,
            recentPosts: blogPosts.slice(0, 3),
            storeMap,
            SITE_URL,
        });
    } catch (err) {
        console.error('[StoreController]', err);
        next(err);
    }
}

module.exports = { getStore };
