'use strict';

const dataService = require('../services/data.service');
const { buildMeta, buildHreflangTags, SITE_URL } = require('../services/seo.service');

const VALID_COUNTRIES = ['sa', 'ae', 'eg', 'kw', 'qa', 'bh', 'om'];

async function renderStatic(req, res, next, pageName, titleAr, descAr) {
    try {
        const countryCode = req.params.country;
        if (!VALID_COUNTRIES.includes(countryCode)) return res.redirect(301, `/sa/${pageName}`);

        const [countries, country, adBanners, blogPosts, trackingConfig, socialConfig] = await Promise.all([
            dataService.getCountries(),
            dataService.getCountries().then(cs => cs.find(c => c.code === countryCode)),
            dataService.getAdBannersForCountry(countryCode),
            dataService.getBlogPostsForCountry(countryCode),
            dataService.getTrackingConfig(),
            dataService.getSocialConfig(),
        ]);

        const meta = buildMeta({
            title: `${titleAr} | ركن الكوبونات`,
            description: descAr,
            canonical: `${SITE_URL}/${countryCode}/${pageName}`,
        });

        const hreflangTags = buildHreflangTags(countries, `/${countryCode}/${pageName}`);

        res.render('pages/static', {
            title: meta.title,
            meta,
            jsonLd: null,
            hreflangTags,
            trackingConfig,
            socialConfig,
            countryCode,
            countries,
            country,
            pageName,
            pageTitle: titleAr,
            adBanners,
            recentPosts: blogPosts.slice(0, 3),
            SITE_URL,
        });
    } catch (err) {
        next(err);
    }
}

const getAbout = (req, res, next) =>
    renderStatic(req, res, next, 'about', 'عن موقع ركن الكوبونات', 'تعرف على موقع ركن الكوبونات - منصتك الأولى للكوبونات والعروض في العالم العربي.');

const getContact = (req, res, next) =>
    renderStatic(req, res, next, 'contact', 'اتصل بنا', 'تواصل مع فريق ركن الكوبونات لأي استفسار أو اقتراح.');

const getPrivacy = (req, res, next) =>
    renderStatic(req, res, next, 'privacy', 'سياسة الخصوصية', 'اقرأ سياسة الخصوصية لموقع ركن الكوبونات.');

module.exports = { getAbout, getContact, getPrivacy };
